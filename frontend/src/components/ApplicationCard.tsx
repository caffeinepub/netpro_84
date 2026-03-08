import { Briefcase } from "lucide-react";
import { useJob } from "../hooks/useQueries";
import { fromNanoseconds, formatDate } from "../utils/formatting";
import type { JobApplication } from "../backend";

interface ApplicationCardProps {
  application: JobApplication;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const { data: job } = useJob(application.jobId);

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 flex flex-col gap-2 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0">
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {job?.title ?? `Job #${application.jobId.toString()}`}
            </p>
            {job?.company && (
              <p className="text-xs text-muted-foreground truncate">
                {job.company}
              </p>
            )}
          </div>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          Applied {formatDate(fromNanoseconds(application.createdAt))}
        </span>
      </div>
      {application.coverLetter && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {application.coverLetter}
        </p>
      )}
    </div>
  );
}
