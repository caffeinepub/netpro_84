import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConversations } from "../hooks/useQueries";
import { UserName, UserAvatar } from "./UserDisplay";
import { fromNanoseconds, formatRelative } from "../utils/formatting";
import type { Profile } from "../backend";

interface ConversationListProps {
  selectedPartner: string | null;
  onSelectPartner: (principalStr: string) => void;
  searchFilter?: string;
}

function abbreviatePrincipal(principalStr: string): string {
  if (principalStr.length <= 12) return principalStr;
  return `${principalStr.slice(0, 6)}...`;
}

function truncateMessage(message: string, maxLength = 50): string {
  if (message.length <= maxLength) return message;
  return `${message.slice(0, maxLength)}...`;
}

export function ConversationList({
  selectedPartner,
  onSelectPartner,
  searchFilter,
}: ConversationListProps) {
  const { data: conversations, isLoading, isError } = useConversations();
  const queryClient = useQueryClient();

  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    if (!searchFilter?.trim()) return conversations;
    const query = searchFilter.toLowerCase();
    return conversations.filter((convo) => {
      const partnerStr = convo.partner.toString();
      const profile = queryClient.getQueryData<Profile | null>([
        "publicProfile",
        partnerStr,
      ]);
      if (profile?.name && profile.name.toLowerCase().includes(query))
        return true;
      if (convo.lastMessage.toLowerCase().includes(query)) return true;
      return partnerStr.toLowerCase().includes(query);
    });
  }, [conversations, searchFilter, queryClient]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive text-sm p-4 text-center">
        Failed to load conversations.
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground px-4">
        <MessageSquare className="h-8 w-8 opacity-30" />
        <p className="text-sm text-center">No conversations yet</p>
      </div>
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground px-4">
        <p className="text-sm text-center">
          No conversations match your search
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border/50">
      {filteredConversations.map((convo) => {
        const partnerStr = convo.partner.toString();
        const isSelected = selectedPartner === partnerStr;
        const unread = Number(convo.unreadCount);

        return (
          <button
            key={partnerStr}
            onClick={() => onSelectPartner(partnerStr)}
            className={cn(
              "flex items-start gap-3 px-4 py-3 text-left w-full transition-all duration-200",
              isSelected
                ? "bg-primary/8 border-l-2 border-l-primary"
                : "hover:bg-accent/40 border-l-2 border-l-transparent",
            )}
          >
            <div className="shrink-0 mt-0.5">
              <UserAvatar principalStr={partnerStr} size="md" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <UserName
                  principalStr={partnerStr}
                  className={cn(
                    "text-sm truncate",
                    unread > 0
                      ? "font-semibold text-foreground"
                      : "font-medium text-foreground",
                  )}
                />
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatRelative(fromNanoseconds(convo.lastMessageAt))}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p
                  className={cn(
                    "text-xs truncate",
                    unread > 0 ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {truncateMessage(convo.lastMessage)}
                </p>
                {unread > 0 && (
                  <span className="shrink-0 bg-destructive text-destructive-foreground text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm shadow-destructive/25">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
