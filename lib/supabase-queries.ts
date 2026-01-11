import { supabase } from "@/lib/supabase";
import type { Job, JobInput, JobStatus, Database } from "@/types/job";

/**
 * Fetch all jobs from the database
 */
export async function getAllJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("last_activity_at", { ascending: false });

  if (error) {
    console.error("Error fetching jobs:", error);
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single job by ID
 */
export async function getJobById(id: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error fetching job:", error);
    throw new Error(`Failed to fetch job: ${error.message}`);
  }

  return data;
}

/**
 * Fetch jobs by status
 */
export async function getJobsByStatus(status: JobStatus): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", status)
    .order("last_activity_at", { ascending: false });

  if (error) {
    console.error("Error fetching jobs by status:", error);
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a new job
 */
export async function createJob(job: JobInput): Promise<Job> {
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      company_name: job.company_name,
      job_title: job.job_title,
      platform: job.platform || null,
      city: job.city || null,
      status: job.status || "discovered",
      priority: job.priority || "medium",
      application_link: job.application_link || null,
      salary_range: job.salary_range || null,
      date_applied: job.date_applied || null,
      notes: job.notes || null,
      match_score: job.match_score || null,
      resume_file_path: job.resume_file_path || null,
    } as any)
    .select()
    .single();

  if (error) {
    console.error("Error creating job:", error);
    throw new Error(`Failed to create job: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing job
 */
export async function updateJob(
  id: string,
  updates: Partial<JobInput>
): Promise<Job> {
  const { data, error } = await supabase
    .from("jobs")
    // @ts-ignore - Type inference issue with Supabase client typing
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating job:", error);
    throw new Error(`Failed to update job: ${error.message}`);
  }

  return data;
}

/**
 * Update job status (useful for drag-and-drop in Kanban)
 */
export async function updateJobStatus(
  id: string,
  status: JobStatus
): Promise<Job> {
  return updateJob(id, { status });
}

/**
 * Update job priority
 */
export async function updateJobPriority(
  id: string,
  priority: JobInput["priority"]
): Promise<Job> {
  if (!priority) {
    throw new Error("Priority is required");
  }
  return updateJob(id, { priority });
}

/**
 * Delete a job
 */
export async function deleteJob(id: string): Promise<void> {
  const { error } = await supabase.from("jobs").delete().eq("id", id);

  if (error) {
    console.error("Error deleting job:", error);
    throw new Error(`Failed to delete job: ${error.message}`);
  }
}

/**
 * Search jobs by company name or job title
 */
export async function searchJobs(query: string): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .or(`company_name.ilike.%${query}%,job_title.ilike.%${query}%`)
    .order("last_activity_at", { ascending: false });

  if (error) {
    console.error("Error searching jobs:", error);
    throw new Error(`Failed to search jobs: ${error.message}`);
  }

  return data || [];
}
