import { Loader2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePublicProfile } from "../hooks/useQueries";

interface SentRequestCardProps {
  principalStr: string;
}

export function SentRequestCard({ principalStr }: SentRequestCardProps) {
  const { data: profile, isLoading } = usePublicProfile(principalStr);

  const displayName =
    profile?.name ||
    (principalStr.length > 12
      ? `${principalStr.slice(0, 6)}...${principalStr.slice(-4)}`
      : principalStr);

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("")
    : principalStr.slice(0, 2).toUpperCase();

  return (
    <div className="bg-card border border-border/50 rounded-xl shadow-xs p-4 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start gap-3">
        {profile?.avatar ? (
          <img
            src={profile.avatar.getDirectURL()}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-border/30 ring-offset-1 ring-offset-card"
          />
        ) : (
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-sm",
              "bg-gradient-to-br from-primary to-chart-2/80",
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              initials
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm leading-tight truncate">
            {isLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : (
              displayName
            )}
          </p>
          {profile?.headline && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
              {profile.headline}
            </p>
          )}
          {profile?.location && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="truncate">{profile.location}</span>
            </p>
          )}
        </div>
      </div>

      {profile?.bio && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {profile.bio}
        </p>
      )}

      <Badge
        variant="outline"
        className="w-fit text-xs border-amber-200 bg-amber-50 text-amber-700"
      >
        <Clock className="mr-1 h-3 w-3" />
        Request Pending
      </Badge>
    </div>
  );
}
