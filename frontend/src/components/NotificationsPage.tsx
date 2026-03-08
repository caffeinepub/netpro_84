import { useEffect, useState } from "react";
import {
  Bell,
  UserPlus,
  MessageSquare,
  Briefcase,
  ThumbsUp,
  MessageCircle,
  Users,
  X,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useNotifications,
  useMarkNotificationsRead,
  useRespondToRequest,
} from "../hooks/useQueries";
import { fromNanoseconds, formatRelative } from "../utils/formatting";
import { NotifKind } from "../backend";

function getNotifIcon(kind: NotifKind) {
  switch (kind) {
    case NotifKind.ConnectionRequest:
      return <UserPlus className="h-4.5 w-4.5 text-primary" />;
    case NotifKind.ConnectionAccepted:
      return <UserPlus className="h-4.5 w-4.5 text-emerald-500" />;
    case NotifKind.NewMessage:
      return <MessageSquare className="h-4.5 w-4.5 text-chart-2" />;
    case NotifKind.JobApplicationReceived:
      return <Briefcase className="h-4.5 w-4.5 text-chart-5" />;
    case NotifKind.PostLiked:
      return <ThumbsUp className="h-4.5 w-4.5 text-primary/70" />;
    case NotifKind.PostCommented:
      return <MessageCircle className="h-4.5 w-4.5 text-chart-4" />;
    case NotifKind.GroupPostCreated:
      return <Users className="h-4.5 w-4.5 text-chart-4" />;
    case NotifKind.SkillEndorsed:
      return <Award className="h-4.5 w-4.5 text-chart-3" />;
    default:
      return <Bell className="h-4.5 w-4.5 text-muted-foreground" />;
  }
}

function isInteractionKind(kind: NotifKind): boolean {
  return (
    kind === NotifKind.ConnectionAccepted ||
    kind === NotifKind.PostLiked ||
    kind === NotifKind.PostCommented
  );
}

interface NotificationsPageProps {
  onNavigate?: (page: string) => void;
}

export function NotificationsPage({ onNavigate }: NotificationsPageProps) {
  const { data: notifications, isLoading, isError } = useNotifications();
  const { mutate: markAllRead } = useMarkNotificationsRead();
  const { mutate: respondToRequest } = useRespondToRequest();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const unreadNotifications = notifications?.filter((n) => !n.read) ?? [];
  const hasUnread = unreadNotifications.length > 0;

  useEffect(() => {
    if (hasUnread) {
      markAllRead();
    }
  }, [hasUnread, markAllRead]);

  const sorted = notifications
    ? [...notifications].sort((a, b) => Number(b.createdAt - a.createdAt))
    : [];

  const unreadSorted = sorted.filter((n) => !n.read);
  const interactionsSorted = sorted.filter((n) => isInteractionKind(n.kind));

  const handleAccept = (requestId: bigint) => {
    respondToRequest(
      { requestId, accept: true },
      {
        onSuccess: () => toast.success("Connection accepted."),
        onError: () => toast.error("Failed to accept request."),
      },
    );
  };

  const handleDecline = (requestId: bigint) => {
    respondToRequest(
      { requestId, accept: false },
      {
        onSuccess: () => toast.success("Connection declined."),
        onError: () => toast.error("Failed to decline request."),
      },
    );
  };

  const handleDismiss = (notifId: string) => {
    setDismissedIds((prev) => new Set([...prev, notifId]));
  };

  function renderNotification(notif: (typeof sorted)[0]) {
    if (dismissedIds.has(String(notif.id))) return null;

    return (
      <div
        key={String(notif.id)}
        className={cn(
          "p-4 rounded-xl border transition-all duration-300 group",
          notif.read
            ? "border-border/40 bg-card hover:bg-accent/30"
            : "border-primary/20 bg-primary/[0.03] hover:bg-primary/[0.05]",
        )}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              "shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-colors duration-200",
              !notif.read ? "bg-primary/8" : "bg-muted/60",
            )}
          >
            {getNotifIcon(notif.kind)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm leading-snug",
                    !notif.read
                      ? "font-semibold text-foreground"
                      : "text-foreground/90",
                  )}
                >
                  {notif.message}
                </p>
                <p className="text-[11px] text-muted-foreground/70 mt-1">
                  {formatRelative(fromNanoseconds(notif.createdAt))}
                </p>
              </div>
              {!notif.read && (
                <div className="relative shrink-0 mt-1.5">
                  <div className="h-2 w-2 bg-primary rounded-full" />
                  <div className="absolute inset-0 h-2 w-2 bg-primary rounded-full animate-unread-ping" />
                </div>
              )}
            </div>

            {notif.kind === NotifKind.ConnectionRequest && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  className="h-8 shadow-sm shadow-primary/15 transition-all duration-200"
                  onClick={() => handleAccept(notif.referenceId)}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-border/50 hover:bg-destructive/5 hover:border-destructive/30 hover:text-destructive transition-all duration-200"
                  onClick={() => handleDecline(notif.referenceId)}
                >
                  Decline
                </Button>
              </div>
            )}
            {notif.kind === NotifKind.NewMessage && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 mt-3 border-border/50 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-200"
                onClick={() => onNavigate?.("messages")}
              >
                Reply
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-foreground"
            onClick={() => handleDismiss(String(notif.id))}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-border/40 bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Notifications
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {unreadNotifications.length > 0 &&
                  `${unreadNotifications.length} new`}
              </p>
            </div>
            {hasUnread && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllRead()}
                className="border-border/50 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-200"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card border border-border/40 rounded-xl p-4 flex gap-3.5 animate-pulse"
              >
                <div className="h-10 w-10 rounded-xl bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-destructive text-sm">
            Failed to load notifications.
          </div>
        )}

        {!isLoading && !isError && (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {sorted.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                <Badge variant="default" className="ml-2">
                  {unreadSorted.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2">
              {sorted.length > 0 ? (
                sorted.map(renderNotification)
              ) : (
                <div className="py-16 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <Bell className="h-7 w-7 text-muted-foreground/40" />
                  </div>
                  <p className="font-serif text-lg text-foreground/70">
                    No notifications yet
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="unread" className="space-y-2">
              {unreadSorted.length > 0 ? (
                unreadSorted.map(renderNotification)
              ) : (
                <div className="py-16 text-center">
                  <p className="font-serif text-lg text-foreground/70">
                    All caught up
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No unread notifications
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="interactions" className="space-y-2">
              {interactionsSorted.length > 0 ? (
                interactionsSorted.map(renderNotification)
              ) : (
                <div className="py-16 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="h-7 w-7 text-muted-foreground/40" />
                  </div>
                  <p className="font-serif text-lg text-foreground/70">
                    No interactions yet
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}
