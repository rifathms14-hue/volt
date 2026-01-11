"use server";

import { createClient } from "@/lib/supabase/server";
import type { Job, JobInput } from "@/types/job";
import { revalidatePath } from "next/cache";
import { calculateMatchScoreAction } from "@/actions/calculate-match-score";

/**
 * Server Action: Update an existing job
 * Updates a job in Supabase and revalidates the page
 * Optionally uploads resume and calculates match score
 */
export async function updateJobAction(
  jobId: string,
  job: Partial<JobInput>
): Promise<{ success: boolean; error?: string; job?: Job }> {
  try {
    const supabase = await createClient();

    // Validate required fields if they're being updated
    if (job.company_name !== undefined && !job.company_name) {
      return {
        success: false,
        error: "Company name cannot be empty",
      };
    }
    if (job.job_title !== undefined && !job.job_title) {
      return {
        success: false,
        error: "Job title cannot be empty",
      };
    }

    // Prepare update data
    const updateData: Partial<JobInput> = {};
    if (job.company_name !== undefined) updateData.company_name = job.company_name;
    if (job.job_title !== undefined) updateData.job_title = job.job_title;
    if (job.platform !== undefined) updateData.platform = job.platform || null;
    if (job.city !== undefined) updateData.city = job.city || null;
    if (job.status !== undefined) updateData.status = job.status;
    if (job.priority !== undefined) updateData.priority = job.priority;
    if (job.application_link !== undefined) updateData.application_link = job.application_link || null;
    if (job.salary_range !== undefined) updateData.salary_range = job.salary_range || null;
    if (job.date_applied !== undefined) updateData.date_applied = job.date_applied || null;
    if (job.notes !== undefined) updateData.notes = job.notes || null;

    // Update the job
    const { data, error } = await supabase
      .from("jobs")
      .update(updateData)
      .eq("id", jobId)
      .select()
      .single();

    if (error) {
      console.error("Error updating job:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      // Provide more specific error messages
      let errorMessage = `Failed to update job: ${error.message}`;
      if (error.code === "42501") {
        errorMessage = "Permission denied. Check RLS policies in Supabase.";
      } else if (error.code === "42P01") {
        errorMessage = "Table 'jobs' does not exist. Run the migration first.";
      } else if (error.message.includes("row-level security")) {
        errorMessage = "RLS policy blocking update. Check Supabase policies.";
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    const updatedJob = data as Job;

    // Calculate match score if resume and application_link are provided
    if (
      updatedJob.resume_file_path &&
      updatedJob.application_link &&
      updatedJob.id
    ) {
      // Run match score calculation asynchronously (don't block job update)
      calculateMatchScoreAction(updatedJob.id).catch((error) => {
        console.error("Error calculating match score:", error);
        // Don't fail job update if score calculation fails
      });
    }

    // Revalidate the page to show updated job
    revalidatePath("/");

    return {
      success: true,
      job: updatedJob,
    };
  } catch (error) {
    console.error("Error in updateJobAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
