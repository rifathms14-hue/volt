import type { Job, JobStatus, JobPriority, JobWithComputed } from "@/types/job";

/**
 * Job Status Configuration
 * Defines the display properties for each job status
 */
export const JOB_STATUS_CONFIG: Record<
  JobStatus,
  { label: string; order: number }
> = {
  discovered: { label: "Discovered", order: 0 },
  applied: { label: "Applied", order: 1 },
  screening: { label: "Screening", order: 2 },
  technical: { label: "Technical", order: 3 },
  final_round: { label: "Final Round", order: 4 },
  offer: { label: "Offer", order: 5 },
  rejected: { label: "Rejected", order: 6 },
};

/**
 * Job Priority Configuration
 * Defines the display properties for each priority level
 */
export const JOB_PRIORITY_CONFIG: Record<
  JobPriority,
  { label: string; order: number; badgeVariant: "default" | "secondary" | "desperate" | "outline" }
> = {
  low: { label: "Low", order: 0, badgeVariant: "outline" },
  medium: { label: "Medium", order: 1, badgeVariant: "secondary" },
  high: { label: "High", order: 2, badgeVariant: "default" },
  desperate: { label: "Desperate", order: 3, badgeVariant: "desperate" },
};

/**
 * Get all job statuses in order
 */
export function getJobStatuses(): JobStatus[] {
  return Object.keys(JOB_STATUS_CONFIG) as JobStatus[];
}

/**
 * Get all job priorities in order
 */
export function getJobPriorities(): JobPriority[] {
  return Object.keys(JOB_PRIORITY_CONFIG) as JobPriority[];
}

/**
 * Calculate days since last activity
 */
export function calculateDaysSinceActivity(lastActivityAt: string): number {
  const lastActivity = new Date(lastActivityAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastActivity.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Add computed properties to a job
 */
export function addComputedProperties(job: Job): JobWithComputed {
  return {
    ...job,
    isDesperate: job.priority === "desperate",
    daysSinceActivity: calculateDaysSinceActivity(job.last_activity_at),
  };
}

/**
 * Sort jobs by status order (for Kanban board)
 */
export function sortJobsByStatus(jobs: Job[]): Job[] {
  return [...jobs].sort((a, b) => {
    const orderA = JOB_STATUS_CONFIG[a.status].order;
    const orderB = JOB_STATUS_CONFIG[b.status].order;
    return orderA - orderB;
  });
}

/**
 * Sort jobs by priority (highest first)
 */
export function sortJobsByPriority(jobs: Job[]): Job[] {
  return [...jobs].sort((a, b) => {
    const orderA = JOB_PRIORITY_CONFIG[a.priority].order;
    const orderB = JOB_PRIORITY_CONFIG[b.priority].order;
    return orderB - orderA; // Reverse for highest first
  });
}

/**
 * Sort jobs by last activity (most recent first)
 */
export function sortJobsByLastActivity(jobs: Job[]): Job[] {
  return [...jobs].sort((a, b) => {
    const dateA = new Date(a.last_activity_at).getTime();
    const dateB = new Date(b.last_activity_at).getTime();
    return dateB - dateA; // Most recent first
  });
}

/**
 * Group jobs by status (for Kanban board columns)
 */
export function groupJobsByStatus(jobs: Job[]): Record<JobStatus, Job[]> {
  const grouped = getJobStatuses().reduce((acc, status) => {
    acc[status] = [];
    return acc;
  }, {} as Record<JobStatus, Job[]>);

  jobs.forEach((job) => {
    grouped[job.status].push(job);
  });

  // Sort each group by priority and last activity
  Object.keys(grouped).forEach((status) => {
    grouped[status as JobStatus] = sortJobsByPriority(
      sortJobsByLastActivity(grouped[status as JobStatus])
    );
  });

  return grouped;
}
