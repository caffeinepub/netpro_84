import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { useApplyToJob } from "../hooks/useQueries";
import type { JobPosting } from "../backend";

interface ApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobPosting;
}

export function ApplyDialog({ open, onOpenChange, job }: ApplyDialogProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: applyToJob, isPending } = useApplyToJob();

  useEffect(() => {
    if (open) {
      setCoverLetter("");
      setResumeFile(null);
      setError("");
    }
  }, [open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume must be under 5MB.");
      return;
    }
    setResumeFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (coverLetter.trim().length < 50) {
      setError("Cover letter must be at least 50 characters.");
      return;
    }

    applyToJob(
      {
        jobId: job.id,
        coverLetter: coverLetter.trim(),
        resumeFile: resumeFile ?? undefined,
      },
      {
        onSuccess: () => {
          toast.success("Application submitted!");
          onOpenChange(false);
        },
        onError: (err) => {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to submit application.",
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply: {job.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cover-letter">
              Cover Letter{" "}
              <span className="text-muted-foreground text-xs">
                (min 50 chars)
              </span>
            </Label>
            <Textarea
              id="cover-letter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the employer why you're a great fit..."
              rows={6}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground text-right">
              {coverLetter.trim().length} characters
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>
              Resume{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            {resumeFile ? (
              <div className="flex items-center gap-2 rounded-md border border-input px-3 py-2">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate flex-1">
                  {resumeFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setResumeFile(null)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">
              Max 5MB. PDF, DOC, or DOCX.
            </p>
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
              {isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
