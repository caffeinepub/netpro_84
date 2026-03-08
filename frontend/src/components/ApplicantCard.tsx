import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  usePublicProfile,
  useEndorsements,
  useUpdateApplicationStatus,
} from "../hooks/useQueries";
import { fromNanoseconds, formatDate } from "../utils/formatting";
import { ApplicationStatus } from "../backend";
import type { JobApplication } from "../backend";

interface ApplicantCardProps {
  application: JobApplication;
  onViewProfile: (principalStr: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function ApplicantCard({
  application,
  onViewProfile,
}: ApplicantCardProps) {
  const principalStr = application.applicantPrincipal.toString();
  const { data: profile } = usePublicProfile(principalStr);
  const { data: endorsements } = useEndorsements(principalStr);
  const { mutate: updateStatus, isPending } = useUpdateApplicationStatus();

  const endorsementCount = endorsements?.length ?? 0;

  const topSkills = endorsements
    ? Object.entries(
        endorsements.reduce<Record<string, number>>((acc, e) => {
          acc[e.skill] = (acc[e.skill] ?? 0) + 1;
          return acc;
        }, {}),
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
    : [];

  const handleStatusChange = (status: ApplicationStatus) => {
    updateStatus(
      { applicationId: application.id, status },
      {
        onSuccess: () => {
          const label =
            status === ApplicationStatus.Accepted
              ? "accepted"
              : status === ApplicationStatus.Rejected
                ? "rejected"
                : "reset to applied";
          toast.success(`Applicant ${label}`);
        },
        onError: () => toast.error("Failed to update status"),
      },
    );
  };

  const currentStatus = application.status;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card/50 p-4 transition-all duration-200 hover:bg-card hover:shadow-sm",
        currentStatus === ApplicationStatus.Accepted &&
          "border-green-300/60 bg-green-50/30",
        currentStatus === ApplicationStatus.Rejected &&
          "border-red-300/60 bg-red-50/30",
        currentStatus === ApplicationStatus.Applied && "border-border/40",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onViewProfile(principalStr)}
          className="shrink-0 group"
        >
          <Avatar className="h-10 w-10 ring-2 ring-primary/10 ring-offset-1 ring-offset-card group-hover:ring-primary/30 transition-all duration-200">
            <AvatarImage src={profile?.avatar?.getDirectURL() ?? undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-chart-4 text-primary-foreground text-xs font-semibold">
              {profile ? getInitials(profile.name) : "?"}
            </AvatarFallback>
          </Avatar>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <button
                onClick={() => onViewProfile(principalStr)}
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200 truncate block"
              >
                {profile?.name ?? "Loading..."}
              </button>
              {profile?.headline && (
                <p className="text-xs text-muted-foreground truncate">
                  {profile.headline}
                </p>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
              Applied {formatDate(fromNanoseconds(application.createdAt))}
            </span>
          </div>

          {application.coverLetter && (
            <p className="text-xs text-foreground/80 mt-2 line-clamp-2 leading-relaxed">
              {application.coverLetter}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {topSkills.map(([skill, count]) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-[10px] px-1.5 py-0"
              >
                {skill}
                {count > 1 && (
                  <span className="ml-0.5 text-muted-foreground">
                    ({count})
                  </span>
                )}
              </Badge>
            ))}
            {endorsementCount > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {endorsementCount} endorsement
                {endorsementCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewProfile(principalStr)}
              className="h-7 text-xs border-border/50 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-200"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Profile
            </Button>
            {application.resume && (
              <a
                href={application.resume.getDirectURL()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground hover:text-primary"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Resume
                </Button>
              </a>
            )}

            <div className="ml-auto flex items-center gap-1.5">
              {isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
              <Button
                size="sm"
                variant={
                  currentStatus === ApplicationStatus.Accepted
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  handleStatusChange(
                    currentStatus === ApplicationStatus.Accepted
                      ? ApplicationStatus.Applied
                      : ApplicationStatus.Accepted,
                  )
                }
                disabled={isPending}
                className={cn(
                  "h-7 text-xs",
                  currentStatus === ApplicationStatus.Accepted
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400",
                )}
              >
                <Check className="h-3 w-3 mr-1" />
                {currentStatus === ApplicationStatus.Accepted
                  ? "Accepted"
                  : "Accept"}
              </Button>
              <Button
                size="sm"
                variant={
                  currentStatus === ApplicationStatus.Rejected
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  handleStatusChange(
                    currentStatus === ApplicationStatus.Rejected
                      ? ApplicationStatus.Applied
                      : ApplicationStatus.Rejected,
                  )
                }
                disabled={isPending}
                className={cn(
                  "h-7 text-xs",
                  currentStatus === ApplicationStatus.Rejected
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400",
                )}
              >
                <X className="h-3 w-3 mr-1" />
                {currentStatus === ApplicationStatus.Rejected
                  ? "Rejected"
                  : "Reject"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
