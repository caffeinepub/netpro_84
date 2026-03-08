import { useState } from "react";
import { Loader2, MapPin, UserPlus, MessageSquare, Clock } from "lucide-react";
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
  usePublicProfile,
  useRemoveConnection,
  useSendConnectionRequest,
} from "../hooks/useQueries";
import { toast } from "sonner";

interface ConnectionCardProps {
  principalStr: string;
  onViewProfile: (principalStr: string) => void;
  onNavigateToMessages?: (principalStr: string) => void;
  showRemoveButton?: boolean;
  showConnectButton?: boolean;
  showPendingState?: boolean;
  showMessageButton?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function abbreviatePrincipal(principalStr: string): string {
  if (principalStr.length <= 12) return principalStr;
  return `${principalStr.slice(0, 6)}...${principalStr.slice(-4)}`;
}

export function ConnectionCard({
  principalStr,
  onViewProfile,
  onNavigateToMessages,
  showRemoveButton = false,
  showConnectButton = false,
  showPendingState = false,
  showMessageButton = false,
}: ConnectionCardProps) {
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const { data: profile, isLoading, isError } = usePublicProfile(principalStr);
  const { mutate: removeConnection, isPending: isRemoving } =
    useRemoveConnection();
  const { mutate: sendConnectionRequest, isPending: isConnecting } =
    useSendConnectionRequest();

  const displayName = isError
    ? abbreviatePrincipal(principalStr)
    : profile?.name || abbreviatePrincipal(principalStr);
  const initials = profile?.name
    ? getInitials(profile.name)
    : abbreviatePrincipal(principalStr).slice(0, 2).toUpperCase();

  const handleRemove = () => {
    removeConnection(principalStr, {
      onSuccess: () => {
        toast.success("Connection removed");
        setConfirmRemoveOpen(false);
      },
      onError: () => {
        toast.error("Failed to remove connection");
      },
    });
  };

  const handleConnect = () => {
    sendConnectionRequest(principalStr, {
      onSuccess: () => {
        toast.success("Connection request sent");
      },
      onError: () => {
        toast.error("Failed to send connection request");
      },
    });
  };

  return (
    <>
      <div className="bg-card border border-border/40 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md hover:border-border/60 transition-all duration-300 group">
        <div className="flex items-start gap-3">
          {profile?.avatar ? (
            <img
              src={profile.avatar.getDirectURL()}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-border/20 ring-offset-2 ring-offset-card"
            />
          ) : (
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0",
                "bg-gradient-to-br from-primary to-chart-4",
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
            <button
              type="button"
              className="font-semibold text-foreground text-sm leading-tight truncate hover:text-primary text-left transition-colors duration-200"
              onClick={() => onViewProfile(principalStr)}
            >
              {isLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                displayName
              )}
            </button>
            {profile?.headline && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 leading-snug">
                {profile.headline}
              </p>
            )}
            {profile?.location && (
              <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{profile.location}</span>
              </p>
            )}
          </div>
        </div>

        {profile?.bio && (
          <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
            {profile.bio}
          </p>
        )}

        <div className="flex items-center gap-2">
          {showRemoveButton && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-border/50 hover:bg-destructive/5 hover:border-destructive/30 hover:text-destructive transition-all duration-200"
              onClick={() => setConfirmRemoveOpen(true)}
            >
              Remove
            </Button>
          )}

          {showMessageButton && onNavigateToMessages && (
            <Button
              size="sm"
              className="flex-1 shadow-sm shadow-primary/15 transition-all duration-200"
              onClick={() => onNavigateToMessages(principalStr)}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          )}

          {showConnectButton && !showPendingState && (
            <Button
              size="sm"
              className="flex-1 shadow-sm shadow-primary/15 transition-all duration-200"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <UserPlus className="mr-2 h-4 w-4" />
              Connect
            </Button>
          )}

          {showPendingState && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-amber-200/60 bg-amber-50 text-amber-700 hover:bg-amber-50 cursor-default"
              disabled
            >
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              Request Sent
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove connection?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {displayName} from your
              connections? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRemoving ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
