import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Loader2 } from "lucide-react";
import type { Group } from "../backend";

interface GroupCardProps {
  group: Group;
  isMember: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onSelect: () => void;
  isJoining?: boolean;
  isLeaving?: boolean;
}

export function GroupCard({
  group,
  isMember,
  onJoin,
  onLeave,
  onSelect,
  isJoining,
  isLeaving,
}: GroupCardProps) {
  const isLoading = isJoining || isLeaving;

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 flex flex-col gap-3 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex flex-col gap-1">
        <button
          className="text-left font-semibold text-base hover:underline focus:outline-none"
          onClick={onSelect}
        >
          {group.name}
        </button>
        {group.industry && (
          <Badge variant="outline" className="w-fit text-xs">
            {group.industry}
          </Badge>
        )}
      </div>
      {group.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {group.description}
        </p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <Users className="h-3.5 w-3.5" />
          <span>{group.memberCount.toString()} members</span>
        </div>
        {isMember ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onLeave}
            disabled={isLoading}
            className="active:scale-[0.97] transition-all duration-200"
          >
            {isLeaving && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            Leave
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onJoin}
            disabled={isLoading}
            className="shadow-sm shadow-primary/20 active:scale-[0.97] transition-all duration-200"
          >
            {isJoining && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            Join
          </Button>
        )}
      </div>
    </div>
  );
}
