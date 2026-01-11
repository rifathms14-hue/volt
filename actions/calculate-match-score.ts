"use server";

import { createClient } from "@/lib/supabase/server";
import { downloadResume } from "@/lib/services/resume-storage";
import { extractTextFromResume } from "@/lib/services/text-extraction";
import { fetchJobDescription } from "@/lib/services/job-scraper";
import { calculateMatchScore } from "@/lib/services/ai-matching";
import { revalidatePath } from "next/cache";

/**
 * Calculate match score for a job
 * @param jobId - The job ID
 * @returns Result with score or error
 */
export async function calculateMatchScoreAction(
  jobId: string
): Promise<{ success: boolean; score?: number; error?: string }> {
  try {
    const supabase = await createClient();

    // Fetch job from database
    const { data: job, error: fetchError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (fetchError) {
      console.error("Error fetching job:", fetchError);
      return {
        success: false,
        error: `Failed to fetch job: ${fetchError.message}`,
      };
    }

    if (!job) {
      return {
        success: false,
        error: "Job not found",
      };
    }

    // Check if resume file path exists
    if (!job.resume_file_path) {
      return {
        success: false,
        error: "No resume file found for this job",
      };
    }

    // Check if application link exists
    if (!job.application_link) {
      return {
        success: false,
        error: "No application link found for this job",
      };
    }

    // Download resume file
    const resumeResult = await downloadResume(job.resume_file_path);
    if (!resumeResult.success || !resumeResult.buffer) {
      return {
        success: false,
        error: resumeResult.error || "Failed to download resume file",
      };
    }

    // Extract text from resume
    let resumeText: string;
    try {
      resumeText = await extractTextFromResume(
        resumeResult.buffer,
        job.resume_file_path
      );
    } catch (error) {
      console.error("Error extracting resume text:", error);
      return {
        success: false,
        error: `Failed to extract text from resume: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }

    if (!resumeText || resumeText.length < 50) {
      return {
        success: false,
        error: "Could not extract sufficient text from resume",
      };
    }

    // Fetch job description
    let jobDescription: string;
    try {
      jobDescription = await fetchJobDescription(job.application_link);
    } catch (error) {
      console.error("Error fetching job description:", error);
      return {
        success: false,
        error: `Failed to fetch job description: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }

    if (!jobDescription || jobDescription.length < 50) {
      return {
        success: false,
        error: "Could not extract sufficient job description from URL",
      };
    }

    // Calculate match score using AI
    let score: number;
    try {
      score = await calculateMatchScore(resumeText, jobDescription);
    } catch (error) {
      console.error("Error calculating match score:", error);
      return {
        success: false,
        error: `Failed to calculate match score: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }

    // Update job record with match score
    const { error: updateError } = await supabase
      .from("jobs")
      .update({ match_score: score })
      .eq("id", jobId);

    if (updateError) {
      console.error("Error updating job with match score:", updateError);
      return {
        success: false,
        error: `Failed to update job: ${updateError.message}`,
      };
    }

    // Revalidate the page to show updated score
    revalidatePath("/");

    return {
      success: true,
      score,
    };
  } catch (error) {
    console.error("Error in calculateMatchScoreAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
