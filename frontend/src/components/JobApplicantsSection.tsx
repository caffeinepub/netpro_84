import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApplicationsForJob } from "../hooks/useQueries";
import { ApplicantCard } from "./ApplicantCard";

interface JobApplicantsSectionProps {
  jobId: bigint;
  onViewProfile: (principalStr: string) => void;
}

export function JobApplicantsSection({
  jobId,
  onViewProfile,
}: JobApplicantsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const {
    data: applications,
    isLoading,
    isError,
  } = useApplicationsForJob(expanded ? jobId : null);

  const count = applications?.length;

  return (
    <div className="mt-3 pt-3 border-t border-border/30">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
        className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5 px-2"
      >
        <Users className="h-3.5 w-3.5" />
        {expanded ? "Hide" : "View"} Applicants
        {count !== undefined && (
          <span className="ml-0.5 font-semibold text-foreground">{count}</span>
        )}
        {expanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </Button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-xs py-3 px-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading applicants...
            </div>
          )}

          {isError && (
            <p className="text-destructive text-xs px-2">
              Failed to load applicants.
            </p>
          )}

          {!isLoading && applications && applications.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-3">
              No applications yet.
            </p>
          )}

          {applications?.map((app) => (
            <ApplicantCard
              key={app.id.toString()}
              application={app}
              onViewProfile={onViewProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
