"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { updateJobAction } from "@/actions/update-job";
import { uploadResume } from "@/lib/services/resume-storage";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { JobStatus, JobPriority, Job } from "@/types/job";

/**
 * Form validation schema
 */
const jobFormSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  job_title: z.string().min(1, "Job title is required"),
  application_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  resume: z
    .instanceof(File, { message: "Invalid file" })
    .refine(
      (file) => !file || file.size <= 10 * 1024 * 1024,
      "File size must be less than 10MB"
    )
    .refine(
      (file) => !file || ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type),
      "Only .pdf and .docx files are allowed"
    )
    .optional()
    .nullable(),
  platform: z.string().min(1, "Platform is required"),
  city: z.string().optional(),
  salary_range: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "desperate"]),
  status: z.enum(["discovered", "applied", "screening", "technical", "final_round", "offer", "rejected"]).optional(),
  date_applied: z.date().optional().nullable(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface EditJobSheetProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Edit Job Sheet Component
 * Slide-over form to edit an existing job with react-hook-form and zod validation
 */
export function EditJobSheet({ job, open, onOpenChange }: EditJobSheetProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      company_name: "",
      job_title: "",
      application_link: "",
      resume: null,
      platform: "LinkedIn",
      city: "",
      salary_range: "",
      priority: "medium",
      status: "applied",
      date_applied: new Date(),
    },
  });

  // Watch priority to change Select border color for desperate priority
  const watchedPriority = watch("priority") as JobPriority;
  const watchedDateApplied = watch("date_applied");
  const watchedResume = watch("resume");

  // Populate form with job data when job changes or sheet opens
  useEffect(() => {
    if (job && open) {
      reset({
        company_name: job.company_name,
        job_title: job.job_title,
        application_link: job.application_link || "",
        resume: null, // Resume file is handled separately
        platform: job.platform || "LinkedIn",
        city: job.city || "",
        salary_range: job.salary_range || "",
        priority: job.priority || "medium",
        status: job.status || "applied",
        date_applied: job.date_applied ? new Date(job.date_applied) : new Date(),
      });
    }
  }, [job, open, reset]);

  const onSubmit = async (data: JobFormValues) => {
    if (!job) return;

    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/93fa6972-1078-4f78-9b1e-cc2f90374789',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'edit-job-sheet.tsx:113',message:'onSubmit entry - raw data',data:{hasDateApplied:!!data.date_applied,dateAppliedType:data.date_applied?.constructor?.name,hasResume:!!data.resume,resumeType:data.resume?.constructor?.name,resumeIsFile:data.resume instanceof File},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      // Convert Date to ISO string for serialization
      const dateAppliedString = data.date_applied instanceof Date 
        ? data.date_applied.toISOString() 
        : null;
      
      // Ensure resume is only passed if it's a File (not null)
      const resumeFile = data.resume instanceof File ? data.resume : undefined;
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/93fa6972-1078-4f78-9b1e-cc2f90374789',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'edit-job-sheet.tsx:125',message:'onSubmit before updateJobAction - job object',data:{jobId:job.id,jobObjKeys:Object.keys({company_name:data.company_name,job_title:data.job_title,application_link:data.application_link || null,platform:data.platform || null,city:data.city || null,salary_range:data.salary_range || null,priority:data.priority,status:(data.status as JobStatus) || "applied",date_applied:dateAppliedString,notes:null}),hasResumeFile:!!resumeFile,resumeFileType:resumeFile?.constructor?.name,dateAppliedString:dateAppliedString},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      const jobPayload = {
        company_name: data.company_name,
        job_title: data.job_title,
        application_link: data.application_link || null,
        platform: data.platform || null,
        city: data.city || null,
        salary_range: data.salary_range || null,
        priority: data.priority,
        status: (data.status as JobStatus) || "applied",
        date_applied: dateAppliedString,
        notes: null,
      };

      // #region agent log
      const checkForUndefined = (obj: any) => {
        const hasUndefined = Object.values(obj).some(v => v === undefined);
        const hasDate = Object.values(obj).some(v => v instanceof Date);
        const hasFile = Object.values(obj).some(v => v instanceof File);
        return {hasUndefined, hasDate, hasFile};
      };
      const undefinedCheck = checkForUndefined(jobPayload);
      fetch('http://127.0.0.1:7244/ingest/93fa6972-1078-4f78-9b1e-cc2f90374789',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'edit-job-sheet.tsx:145',message:'onSubmit jobPayload validation',data:undefinedCheck,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      // Update job without File parameter (File objects cannot be serialized to Server Actions)
      const result = await updateJobAction(
        job.id,
        jobPayload
      );

      if (result.success) {
        // Upload resume separately if provided
        if (resumeFile && result.job?.id) {
          try {
            const uploadResult = await uploadResume(resumeFile, result.job.id);
            if (uploadResult.success && uploadResult.filePath) {
              // Update job with resume file path
              const updateResult = await updateJobAction(result.job.id, {
                resume_file_path: uploadResult.filePath,
              });
              if (updateResult.success && updateResult.job) {
                result.job = updateResult.job;
              }
            }
          } catch (error) {
            console.error("Error uploading resume:", error);
            // Don't fail job update if resume upload fails
          }
        }

        // Close the sheet
        onOpenChange(false);
        // Show success toast
        toast.success("Job Updated", {
          description: `${data.company_name} - ${data.job_title} updated successfully`,
        });
        // Refresh the page to show the updated job
        router.refresh();
      } else {
        toast.error("Failed to update job", {
          description: result.error || "Please try again",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to update job", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Job</SheetTitle>
          <SheetDescription>
            Update job details and track your application pipeline
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company_name">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="company_name"
              {...register("company_name")}
              placeholder="e.g., Tesla"
              disabled={isSubmitting}
            />
            {errors.company_name && (
              <p className="text-sm text-destructive">
                {errors.company_name.message}
              </p>
            )}
          </div>

          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="job_title">
              Job Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="job_title"
              {...register("job_title")}
              placeholder="e.g., Senior Engineer"
              disabled={isSubmitting}
            />
            {errors.job_title && (
              <p className="text-sm text-destructive">
                {errors.job_title.message}
              </p>
            )}
          </div>

          {/* Application Link */}
          <div className="space-y-2">
            <Label htmlFor="application_link">Job Link</Label>
            <Input
              id="application_link"
              type="url"
              {...register("application_link")}
              placeholder="https://..."
              disabled={isSubmitting}
            />
            {errors.application_link && (
              <p className="text-sm text-destructive">
                {errors.application_link.message}
              </p>
            )}
          </div>

          {/* Resume */}
          <div className="space-y-2">
            <Label htmlFor="resume">Resume</Label>
            <FileUpload
              value={watchedResume}
              onChange={(file) => {
                setValue("resume", file || null, { shouldValidate: true });
              }}
              accept=".pdf,.docx"
              maxSize={10 * 1024 * 1024}
              disabled={isSubmitting}
            />
            {errors.resume && (
              <p className="text-sm text-destructive">
                {errors.resume.message}
              </p>
            )}
          </div>

          {/* Platform Applied */}
          <div className="space-y-2">
            <Label htmlFor="platform">
              Platform Applied <span className="text-destructive">*</span>
            </Label>
            <Select
              id="platform"
              {...register("platform")}
              disabled={isSubmitting}
            >
              <option value="LinkedIn">LinkedIn</option>
              <option value="Indeed">Indeed</option>
              <option value="Glassdoor">Glassdoor</option>
              <option value="Company Website">Company Website</option>
              <option value="Referral">Referral</option>
              <option value="Other">Other</option>
            </Select>
            {errors.platform && (
              <p className="text-sm text-destructive">
                {errors.platform.message}
              </p>
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              {...register("city")}
              placeholder="e.g., San Francisco, CA"
              disabled={isSubmitting}
            />
            {errors.city && (
              <p className="text-sm text-destructive">
                {errors.city.message}
              </p>
            )}
          </div>

          {/* Salary Range */}
          <div className="space-y-2">
            <Label htmlFor="salary_range">Salary Range</Label>
            <Input
              id="salary_range"
              {...register("salary_range")}
              placeholder="e.g., $150k - $200k"
              disabled={isSubmitting}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              id="priority"
              {...register("priority")}
              variant={watchedPriority === "desperate" ? "desperate" : "default"}
              disabled={isSubmitting}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="desperate">Desperate</option>
            </Select>
            {watchedPriority === "desperate" && (
              <p className="text-xs text-muted-foreground">
                ⚡ Desperate priority jobs will have a glowing Electric Lime border
              </p>
            )}
            {errors.priority && (
              <p className="text-sm text-destructive">
                {errors.priority.message}
              </p>
            )}
          </div>

          {/* Date Applied */}
          <div className="space-y-2">
            <Label htmlFor="date_applied">Date Applied</Label>
            <DatePicker
              date={watchedDateApplied}
              onDateChange={(date) => {
                setValue("date_applied", date || undefined, { shouldValidate: true });
              }}
              placeholder="Select date applied"
              disabled={isSubmitting}
            />
            {errors.date_applied && (
              <p className="text-sm text-destructive">
                {errors.date_applied.message}
              </p>
            )}
          </div>

          {/* Status (hidden, defaults to "applied") */}
          <input type="hidden" {...register("status")} value="applied" />

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Job"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
