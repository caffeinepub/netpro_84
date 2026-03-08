import { Loader2, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBlockedUsers, useUnblockUser } from "../hooks/useQueries";

function abbreviatePrincipal(p: string): string {
  if (p.length <= 14) return p;
  return `${p.slice(0, 7)}...${p.slice(-5)}`;
}

export function BlockedUsersSection() {
  const { data: blockedUsers, isLoading, isError } = useBlockedUsers();
  const { mutate: unblockUser, isPending: isUnblocking } = useUnblockUser();

  const handleUnblock = (principalStr: string) => {
    unblockUser(principalStr, {
      onSuccess: () => {
        toast.success("User unblocked");
      },
      onError: () => {
        toast.error("Failed to unblock user");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive text-sm">
        Failed to load blocked users.
      </div>
    );
  }

  if (!blockedUsers || blockedUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <UserX className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          You haven't blocked anyone
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {blockedUsers.map((principal) => {
        const principalStr = principal.toString();
        return (
          <div
            key={principalStr}
            className="flex items-center justify-between p-3 border border-border/50 rounded-xl bg-card hover:bg-accent/20 transition-all duration-200"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <UserX className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm text-foreground font-mono truncate">
                {abbreviatePrincipal(principalStr)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUnblock(principalStr)}
              disabled={isUnblocking}
              className="shrink-0 ml-3 hover:bg-primary/5 hover:border-primary/30 active:scale-[0.97] transition-all duration-200"
            >
              {isUnblocking && (
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              )}
              Unblock
            </Button>
          </div>
        );
      })}
    </div>
  );
}
