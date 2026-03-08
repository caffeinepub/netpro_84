import { useState } from "react";
import { Loader2, MapPin, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  useConnectionRequests,
  useRespondToRequest,
  usePublicProfile,
} from "../hooks/useQueries";
import { fromNanoseconds, formatRelative } from "../utils/formatting";
import { toast } from "sonner";
import { ConnStatus } from "../backend";
import type { ConnRequest } from "../backend";

function abbreviatePrincipal(principalStr: string): string {
  if (principalStr.length <= 12) return principalStr;
  return `${principalStr.slice(0, 6)}...${principalStr.slice(-4)}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

interface RequestCardProps {
  request: ConnRequest;
}

function RequestCard({ request }: RequestCardProps) {
  const [declineOpen, setDeclineOpen] = useState(false);
  const fromStr = request.from.toString();
  const { data: profile, isLoading } = usePublicProfile(fromStr);
  const { mutate: respondToRequest, isPending } = useRespondToRequest();

  const displayName = profile?.name || abbreviatePrincipal(fromStr);
  const initials = profile?.name
    ? getInitials(profile.name)
    : abbreviatePrincipal(fromStr).slice(0, 2).toUpperCase();

  const handleAccept = () => {
    respondToRequest(
      { requestId: request.id, accept: true },
      {
        onSuccess: () => {
          toast.success(`Connected with ${displayName}`);
        },
        onError: () => {
          toast.error("Failed to accept request");
        },
      },
    );
  };

  const handleDecline = () => {
    respondToRequest(
      { requestId: request.id, accept: false },
      {
        onSuccess: () => {
          toast.success("Request declined");
          setDeclineOpen(false);
        },
        onError: () => {
          toast.error("Failed to decline request");
        },
      },
    );
  };

  return (
    <>
      <div className="bg-card border border-border/50 rounded-xl shadow-xs p-4 flex items-start gap-4 hover:shadow-sm transition-all duration-300">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-sm",
            "bg-gradient-to-br from-primary to-chart-2/80",
          )}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : initials}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm leading-tight">
            {isLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : (
              displayName
            )}
          </p>
          {profile?.headline && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {profile.headline}
            </p>
          )}
          {profile?.location && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{profile.location}</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {formatRelative(fromNanoseconds(request.createdAt))}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleAccept}
              disabled={isPending}
              className="shadow-sm shadow-primary/20 active:scale-[0.97] transition-all duration-200"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeclineOpen(true)}
              disabled={isPending}
              className="hover:bg-destructive/5 hover:border-destructive/30 hover:text-destructive active:scale-[0.97] transition-all duration-200"
            >
              Decline
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={declineOpen} onOpenChange={setDeclineOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline connection request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to decline the request from {displayName}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDecline}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Declining..." : "Decline"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function PendingRequestsSection() {
  const { data: requests, isLoading, isError } = useConnectionRequests();

  const pendingRequests =
    requests?.filter((r) => r.status === ConnStatus.Pending) ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive text-sm py-8 text-center">
        Failed to load connection requests.
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <Inbox className="h-10 w-10 opacity-30" />
        <p className="text-sm">No pending requests</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {pendingRequests.map((request) => (
        <RequestCard key={request.id.toString()} request={request} />
      ))}
    </div>
  );
}
