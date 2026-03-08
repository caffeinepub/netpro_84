import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateJob, useUpdateJob } from "../hooks/useQueries";
import { INDUSTRIES, EXPERIENCE_LEVELS } from "../utils/constants";
import type { JobPosting } from "../backend";

interface PostJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: JobPosting;
}

export function PostJobDialog({ open, onOpenChange, job }: PostJobDialogProps) {
  const isEdit = !!job;

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [error, setError] = useState("");

  const { mutate: createJob, isPending: isCreating } = useCreateJob();
  const { mutate: updateJob, isPending: isUpdating } = useUpdateJob();
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      setTitle(job?.title ?? "");
      setCompany(job?.company ?? "");
      setDescription(job?.description ?? "");
      setRequirements(job?.requirements ?? "");
      setSalaryRange(job?.salaryRange ?? "");
      setLocation(job?.location ?? "");
      setIndustry(job?.industry ?? "");
      setExperienceLevel(job?.experienceLevel ?? "");
      setError("");
    }
  }, [open, job]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!company.trim()) {
      setError("Company is required.");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    if (isEdit && job) {
      updateJob(
        {
          id: job.id,
          title: title.trim(),
          company: company.trim(),
          description: description.trim(),
          requirements: requirements.trim(),
          salaryRange: salaryRange.trim(),
          location: location.trim(),
          industry,
          experienceLevel,
        },
        {
          onSuccess: () => {
            toast.success("Job posting updated.");
            onOpenChange(false);
          },
          onError: (err) => {
            setError(
              err instanceof Error ? err.message : "Failed to update job.",
            );
          },
        },
      );
    } else {
      createJob(
        {
          title: title.trim(),
          company: company.trim(),
          description: description.trim(),
          requirements: requirements.trim(),
          salaryRange: salaryRange.trim(),
          location: location.trim(),
          industry,
          experienceLevel,
        },
        {
          onSuccess: () => {
            toast.success("Job posted successfully.");
            onOpenChange(false);
          },
          onError: (err) => {
            setError(
              err instanceof Error ? err.message : "Failed to post job.",
            );
          },
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Job Posting" : "Post a Job"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="job-title">Job Title</Label>
            <Input
              id="job-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Engineer"
              disabled={isPending}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="job-company">Company</Label>
            <Input
              id="job-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
              disabled={isPending}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="job-description">Description</Label>
            <Textarea
              id="job-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role..."
              rows={4}
              disabled={isPending}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="job-requirements">Requirements</Label>
            <Textarea
              id="job-requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="List requirements..."
              rows={3}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="job-salary">Salary Range</Label>
              <Input
                id="job-salary"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g. $80k–$120k"
                disabled={isPending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="job-location">Location</Label>
              <Input
                id="job-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote"
                disabled={isPending}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Industry</Label>
              <Select
                value={industry}
                onValueChange={setIndustry}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Experience Level</Label>
              <Select
                value={experienceLevel}
                onValueChange={setExperienceLevel}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="shadow-sm shadow-primary/20 active:scale-[0.97] transition-all duration-200"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending
                ? isEdit
                  ? "Saving..."
                  : "Posting..."
                : isEdit
                  ? "Save Changes"
                  : "Post Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
