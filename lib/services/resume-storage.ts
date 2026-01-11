"use server";

import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "resumes";

/**
 * Upload resume file to Supabase Storage
 * @param file - The file to upload
 * @param jobId - The job ID to associate with the resume
 * @returns The file path in storage
 */
export async function uploadResume(
  file: File,
  jobId: string
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Convert File to ArrayBuffer then to Uint8Array for upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Determine file extension
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const fileName = `resume.${fileExtension}`;
    const filePath = `${jobId}/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true, // Replace if file already exists
      });

    if (uploadError) {
      console.error("Error uploading resume:", uploadError);
      return {
        success: false,
        error: `Failed to upload resume: ${uploadError.message}`,
      };
    }

    return {
      success: true,
      filePath,
    };
  } catch (error) {
    console.error("Error in uploadResume:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Get public URL for resume file
 * @param filePath - The file path in storage
 * @returns The public URL
 */
export async function getResumeUrl(
  filePath: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    console.error("Error in getResumeUrl:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Get signed URL for resume file (for private files)
 * @param filePath - The file path in storage
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns The signed URL
 */
export async function getResumeSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error("Error creating signed URL:", error);
      return {
        success: false,
        error: `Failed to create signed URL: ${error.message}`,
      };
    }

    return {
      success: true,
      url: data.signedUrl,
    };
  } catch (error) {
    console.error("Error in getResumeSignedUrl:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Download resume file from storage
 * @param filePath - The file path in storage
 * @returns The file buffer
 */
export async function downloadResume(
  filePath: string
): Promise<{ success: boolean; buffer?: Uint8Array; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);

    if (error) {
      console.error("Error downloading resume:", error);
      return {
        success: false,
        error: `Failed to download resume: ${error.message}`,
      };
    }

    // Convert Blob to Uint8Array
    const arrayBuffer = await data.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    return {
      success: true,
      buffer,
    };
  } catch (error) {
    console.error("Error in downloadResume:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Delete resume file from storage
 * @param filePath - The file path in storage
 * @returns Success status
 */
export async function deleteResume(
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Error deleting resume:", error);
      return {
        success: false,
        error: `Failed to delete resume: ${error.message}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in deleteResume:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
