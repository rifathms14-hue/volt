"use server";

import { calculateMatchScoreAction } from "@/actions/calculate-match-score";

/**
 * Recalculate match score for an existing job
 * This is the same as calculateMatchScoreAction but with a different name for clarity
 * @param jobId - The job ID
 * @returns Result with score or error
 */
export async function recalculateMatchScoreAction(
  jobId: string
): Promise<{ success: boolean; score?: number; error?: string }> {
  return calculateMatchScoreAction(jobId);
}
