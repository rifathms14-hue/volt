"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Delete a job
 * Deletes a job from Supabase and revalidates the page
 */
export async function deleteJobAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Validate ID
    if (!id) {
      return {
        success: false,
        error: "Job ID is required",
      };
    }

    // Delete the job
    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting job:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      // Provide more specific error messages
      let errorMessage = `Failed to delete job: ${error.message}`;
      if (error.code === "42501") {
        errorMessage = "Permission denied. Check RLS policies in Supabase.";
      } else if (error.code === "42P01") {
        errorMessage = "Table 'jobs' does not exist. Run the migration first.";
      } else if (error.message.includes("row-level security")) {
        errorMessage = "RLS policy blocking delete. Check Supabase policies.";
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Revalidate the page to remove the deleted job
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in deleteJobAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
