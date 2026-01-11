/**
 * Job Status Enum
 * Represents the current stage of a job application
 */
export type JobStatus =
  | "discovered"
  | "applied"
  | "screening"
  | "technical"
  | "final_round"
  | "offer"
  | "rejected";

/**
 * Job Priority Enum
 * Represents the urgency/importance level of a job application
 */
export type JobPriority = "low" | "medium" | "high" | "desperate";

/**
 * Match Score Category
 * Categorizes AI-generated match scores
 */
export type MatchScoreCategory = "low" | "mid" | "high";

/**
 * Job Database Schema
 * Matches the Supabase/PostgreSQL jobs table structure
 */
export interface Job {
  id: string; // UUID
  created_at: string; // ISO timestamp
  company_name: string;
  job_title: string;
  status: JobStatus;
  priority: JobPriority;
  platform: string; // Source/Application platform
  city: string; // Target location/city
  application_link: string | null;
  salary_range: string | null;
  notes: string | null;
  date_applied: string | null; // ISO timestamp - Date when application was submitted
  last_activity_at: string; // ISO timestamp
  match_score: number | null; // AI-generated relevancy score (1-10)
  resume_file_path: string | null; // Path to resume file in Supabase Storage
}

/**
 * Job Input Schema
 * For creating/updating jobs (excludes auto-generated fields)
 */
export interface JobInput {
  company_name: string;
  job_title: string;
  status?: JobStatus;
  priority?: JobPriority;
  platform?: string | null; // Source/Application platform (optional)
  city?: string | null; // Target location/city (optional)
  application_link?: string | null;
  salary_range?: string | null;
  notes?: string | null;
  date_applied?: string | null; // ISO timestamp - Date when application was submitted
  last_activity_at?: string;
  match_score?: number | null; // AI-generated relevancy score (1-10)
  resume_file_path?: string | null; // Path to resume file in Supabase Storage
}

/**
 * Job with computed properties
 * Extends Job with helper properties for UI
 */
export interface JobWithComputed extends Job {
  isDesperate: boolean;
  daysSinceActivity: number;
}

/**
 * Database Schema Type (Supabase return type)
 * This is what Supabase uses for type-safe queries
 * Matches the structure of the jobs table in Supabase
 */
export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: Job;
        Insert: {
          id?: string;
          created_at?: string;
          company_name: string;
          job_title: string;
          status?: JobStatus;
          priority?: JobPriority;
          platform?: string | null;
          city?: string | null;
          application_link?: string | null;
          salary_range?: string | null;
          date_applied?: string | null;
          notes?: string | null;
          match_score?: number | null;
          resume_file_path?: string | null;
          last_activity_at?: string;
        };
        Update: Partial<{
          company_name: string;
          job_title: string;
          status: JobStatus;
          priority: JobPriority;
          platform: string | null;
          city: string | null;
          application_link: string | null;
          salary_range: string | null;
          date_applied: string | null;
          notes: string | null;
          match_score: number | null;
          resume_file_path: string | null;
          last_activity_at: string;
        }>;
      };
    };
    Enums: {
      job_status: JobStatus;
      job_priority: JobPriority;
    };
  };
}
