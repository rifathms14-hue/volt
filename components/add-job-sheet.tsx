"use client";

import { useState } from "react";
import * as React from "react";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { createJobAction } from "@/actions/create-job";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { JobStatus, JobPriority } from "@/types/job";

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

interface AddJobSheetProps {
  defaultStatus?: JobStatus;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Add Job Sheet Component
 * Slide-over form to add a new job with react-hook-form and zod validation
 */
export function AddJobSheet({ defaultStatus = "applied", trigger, open: controlledOpen, onOpenChange: controlledOnOpenChange }: AddJobSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const router = useRouter();
  
  // Use controlled open if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  
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
      status: defaultStatus,
      date_applied: new Date(), // Default to today's date
    },
  });

  // Reset form and set status when sheet opens
  React.useEffect(() => {
    if (open) {
      reset({
        company_name: "",
        job_title: "",
        application_link: "",
        resume: null,
        platform: "LinkedIn",
        city: "",
        salary_range: "",
        priority: "medium",
        status: defaultStatus,
        date_applied: new Date(),
      });
    }
  }, [open, defaultStatus, reset]);

  // Watch priority to change Select border color for desperate priority
  const watchedPriority = watch("priority") as JobPriority;
  const watchedDateApplied = watch("date_applied");
  const watchedResume = watch("resume");

  const onSubmit = async (data: JobFormValues) => {
    try {
      // Convert Date to ISO string for serialization
      const dateAppliedString = data.date_applied instanceof Date 
        ? data.date_applied.toISOString() 
        : null;
      
      const result = await createJobAction(
        {
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
        },
        data.resume || undefined
      );

      if (result.success) {
        // Close the sheet
        setOpen(false);
        // Reset form
        reset();
        // Show success toast
        toast.success("Target Acquired", {
          description: `${data.company_name} - ${data.job_title} added successfully`,
        });
        // Refresh the page to show the new job
        router.refresh();
      } else {
        toast.error("Failed to add job", {
          description: result.error || "Please try again",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to add job", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!trigger && (
        <SheetTrigger asChild>
          <Button variant="default" className="font-medium">
            Add New Job
          </Button>
        </SheetTrigger>
      )}
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>New Hunt</SheetTitle>
          <SheetDescription>
            Add a new job to track your application pipeline
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

          {/* Status (hidden, uses defaultStatus prop) */}
          <input type="hidden" {...register("status")} value={defaultStatus} />

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Job"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
