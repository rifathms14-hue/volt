"use server";

import { createClient } from "@/lib/supabase/server";
import type { Job, JobInput } from "@/types/job";
import { revalidatePath } from "next/cache";
import { uploadResume } from "@/lib/services/resume-storage";
import { calculateMatchScoreAction } from "@/actions/calculate-match-score";

/**
 * Server Action: Create a new job
 * Inserts a job into Supabase and revalidates the page
 * Optionally uploads resume and calculates match score
 */
export async function createJobAction(
  job: JobInput,
  resumeFile?: File
): Promise<{ success: boolean; error?: string; job?: Job }> {
  try {
    const supabase = await createClient();

    // Validate required fields
    if (!job.company_name || !job.job_title) {
      return {
        success: false,
        error: "Company name and job title are required",
      };
    }

    // Insert the job first (we need the ID for resume upload)
    const { data, error } = await supabase
      .from("jobs")
      .insert({
        company_name: job.company_name,
        job_title: job.job_title,
        platform: job.platform || null,
        city: job.city || null,
        status: job.status || "applied",
        priority: job.priority || "medium",
        application_link: job.application_link || null,
        salary_range: job.salary_range || null,
        date_applied: job.date_applied || null,
        notes: job.notes || null,
        resume_file_path: job.resume_file_path || null,
        match_score: job.match_score || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating job:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      // Provide more specific error messages
      let errorMessage = `Failed to create job: ${error.message}`;
      if (error.code === "42501") {
        errorMessage = "Permission denied. Check RLS policies in Supabase.";
      } else if (error.code === "42P01") {
        errorMessage = "Table 'jobs' does not exist. Run the migration first.";
      } else if (error.message.includes("row-level security")) {
        errorMessage = "RLS policy blocking insert. Check Supabase policies.";
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    const createdJob = data as Job;

    // Upload resume if provided
    if (resumeFile && createdJob.id) {
      try {
        const uploadResult = await uploadResume(resumeFile, createdJob.id);
        if (uploadResult.success && uploadResult.filePath) {
          // Update job with resume file path
          const { error: updateError } = await supabase
            .from("jobs")
            .update({ resume_file_path: uploadResult.filePath })
            .eq("id", createdJob.id);

          if (!updateError) {
            createdJob.resume_file_path = uploadResult.filePath;
          }
        }
      } catch (error) {
        console.error("Error uploading resume:", error);
        // Don't fail job creation if resume upload fails
      }
    }

    // Calculate match score if resume and application_link are provided
    if (
      createdJob.resume_file_path &&
      createdJob.application_link &&
      createdJob.id
    ) {
      // Run match score calculation asynchronously (don't block job creation)
      calculateMatchScoreAction(createdJob.id).catch((error) => {
        console.error("Error calculating match score:", error);
        // Don't fail job creation if score calculation fails
      });
    }

    // Revalidate the page to show the new job
    revalidatePath("/");

    return {
      success: true,
      job: createdJob,
    };
  } catch (error) {
    console.error("Error in createJobAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
