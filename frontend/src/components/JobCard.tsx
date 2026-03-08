import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin } from "lucide-react";
import { fromNanoseconds, formatRelative } from "../utils/formatting";
import type { JobPosting } from "../backend";

interface JobCardProps {
  job: JobPosting;
  onApply?: () => void;
  onEdit?: () => void;
  onDeactivate?: () => void;
  showOwnerActions?: boolean;
  onClick?: () => void;
}

export function JobCard({
  job,
  onApply,
  onEdit,
  onDeactivate,
  showOwnerActions,
  onClick,
}: JobCardProps) {
  const postedDate = formatRelative(fromNanoseconds(job.createdAt));

  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card p-4 flex flex-col gap-3 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300",
        !job.active && "opacity-70",
        onClick && "cursor-pointer",
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg leading-tight truncate">
            {job.title}
          </h3>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{job.company}</span>
          </div>
          {job.location && (
            <div className="flex items-center gap-1 text-muted-foreground text-sm mt-0.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
          )}
        </div>
        {!job.active && (
          <Badge variant="secondary" className="shrink-0">
            Closed
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {job.industry && (
          <Badge variant="outline" className="text-xs">
            {job.industry}
          </Badge>
        )}
        {job.experienceLevel && (
          <Badge variant="secondary" className="text-xs">
            {job.experienceLevel}
          </Badge>
        )}
      </div>

      {job.salaryRange && (
        <p className="text-sm font-medium text-foreground">{job.salaryRange}</p>
      )}

      <p className="text-xs text-muted-foreground">Posted {postedDate}</p>

      {(onApply || showOwnerActions) && (
        <div className="flex gap-2 pt-1">
          {onApply && job.active && (
            <Button
              size="sm"
              onClick={onApply}
              className="shadow-sm shadow-primary/20 active:scale-[0.97] transition-all duration-200"
            >
              Apply
            </Button>
          )}
          {showOwnerActions && (
            <>
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onEdit}
                  className="active:scale-[0.97] transition-all duration-200"
                >
                  Edit
                </Button>
              )}
              {onDeactivate && job.active && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDeactivate}
                  className="text-destructive hover:text-destructive active:scale-[0.97] transition-all duration-200"
                >
                  Deactivate
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
