import { Users2, ArrowRight, UserPlus, Share2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  useFeedPosts,
  useProfile,
  useConnections,
  useConnectionSuggestions,
  useSendConnectionRequest,
  useConnectionRequests,
} from "../hooks/useQueries";
import { ConnStatus } from "../backend";
import { PostCard } from "./PostCard";
import { toast } from "sonner";

interface FeedPageProps {
  onNavigate: (page: string) => void;
  onSelectGroup: (groupId: bigint) => void;
  onViewPublicProfile: (principalStr: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function getFirstName(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  return parts[0] ?? "there";
}

function computeProfileStrength(
  profile:
    | {
        name: string;
        headline: string;
        location: string;
        bio: string;
        skills: string[];
        avatar?: { getDirectURL(): string } | null;
      }
    | null
    | undefined,
): number {
  if (!profile) return 0;
  let filled = 0;
  const total = 6;
  if (profile.name) filled += 1;
  if (profile.headline) filled += 1;
  if (profile.location) filled += 1;
  if (profile.bio) filled += 1;
  if (profile.skills && profile.skills.length > 0) filled += 1;
  if (profile.avatar) filled += 1;
  return Math.round((filled / total) * 100);
}

function ProfileStrengthCard({
  profile,
  onNavigate,
}: {
  profile:
    | {
        name: string;
        headline: string;
        location: string;
        bio: string;
        skills: string[];
        avatar?: { getDirectURL(): string } | null;
      }
    | null
    | undefined;
  onNavigate: (page: string) => void;
}) {
  const strength = computeProfileStrength(profile);
  const label =
    strength >= 100
      ? "Complete"
      : strength >= 75
        ? "Strong"
        : strength >= 50
          ? "Intermediate"
          : "Beginner";

  return (
    <div className="bg-card border border-border/40 rounded-xl p-4 space-y-3 animate-card-in">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Profile Strength
        </h3>
        <span
          className={cn(
            "text-xs font-bold tabular-nums",
            strength >= 75
              ? "text-emerald-600"
              : strength >= 50
                ? "text-amber-600"
                : "text-rose-600",
          )}
        >
          {strength}%
        </span>
      </div>
      <div className="space-y-2">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              strength >= 75
                ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                : strength >= 50
                  ? "bg-gradient-to-r from-amber-500 to-amber-400"
                  : "bg-gradient-to-r from-rose-500 to-rose-400",
            )}
            style={{ width: `${strength}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      {strength < 100 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs border-border/50 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-200"
          onClick={() => onNavigate("profile")}
        >
          Complete Your Profile
        </Button>
      )}
    </div>
  );
}

function NetworkActivityCard({
  connectionCount,
  pendingCount,
  onNavigate,
}: {
  connectionCount: number;
  pendingCount: number;
  onNavigate: (page: string) => void;
}) {
  return (
    <div className="bg-card border border-border/40 rounded-xl p-4 space-y-3 animate-card-in-1">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Network
      </h3>
      <div className="space-y-1">
        <button
          onClick={() => onNavigate("network")}
          className="w-full flex items-center justify-between text-sm hover:bg-accent/60 -mx-2 px-2 py-2 rounded-lg transition-all duration-200"
        >
          <span className="text-muted-foreground">Connections</span>
          <span className="font-bold text-foreground tabular-nums">
            {connectionCount}
          </span>
        </button>
        <button
          onClick={() => onNavigate("network")}
          className="w-full flex items-center justify-between text-sm hover:bg-accent/60 -mx-2 px-2 py-2 rounded-lg transition-all duration-200"
        >
          <span className="text-muted-foreground">Pending</span>
          <span
            className={cn(
              "font-bold tabular-nums",
              pendingCount > 0 ? "text-primary" : "text-foreground",
            )}
          >
            {pendingCount}
          </span>
        </button>
      </div>
    </div>
  );
}

function SuggestedConnectionsCard({
  onNavigate,
  onViewPublicProfile,
}: {
  onNavigate: (page: string) => void;
  onViewPublicProfile: (principalStr: string) => void;
}) {
  const { data: suggestions } = useConnectionSuggestions();
  const { mutate: sendRequest } = useSendConnectionRequest();
  const visible = suggestions?.slice(0, 3) ?? [];

  if (visible.length === 0) return null;

  const handleConnect = (principalStr: string) => {
    sendRequest(principalStr, {
      onSuccess: () => toast.success("Connection request sent"),
      onError: () => toast.error("Failed to send request"),
    });
  };

  return (
    <div className="bg-card border border-border/40 rounded-xl p-4 space-y-3 animate-card-in-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        People You May Know
      </h3>
      <div className="space-y-3">
        {visible.map((user) => (
          <div
            key={user.principal.toString()}
            className="flex items-center gap-2.5"
          >
            <button
              onClick={() => onViewPublicProfile(user.principal.toString())}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar?.getDirectURL() ?? undefined} />
                <AvatarFallback className="text-xs bg-primary/8 text-primary font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </button>
            <div className="flex-1 min-w-0">
              <button
                onClick={() => onViewPublicProfile(user.principal.toString())}
                className="text-sm font-medium text-foreground truncate block hover:text-primary text-left transition-colors duration-200"
              >
                {user.name}
              </button>
              {user.headline && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.headline}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 h-7 text-xs gap-1 border-border/50 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-200"
              onClick={() => handleConnect(user.principal.toString())}
            >
              <UserPlus className="h-3 w-3" />
              Add
            </Button>
          </div>
        ))}
      </div>
      <button
        onClick={() => onNavigate("network")}
        className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors duration-200"
      >
        See more
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}

function CreatePostCard({
  profile,
  onNavigate,
}: {
  profile:
    | { name: string; avatar?: { getDirectURL(): string } | null }
    | null
    | undefined;
  onNavigate: (page: string) => void;
}) {
  return (
    <div className="bg-card border border-border/40 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        {profile?.avatar ? (
          <img
            src={profile.avatar.getDirectURL()}
            alt={profile.name}
            className="h-10 w-10 rounded-full object-cover shrink-0 ring-2 ring-border/30 ring-offset-2 ring-offset-card"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center shrink-0 ring-2 ring-primary/15 ring-offset-2 ring-offset-card">
            <span className="text-sm font-semibold text-primary-foreground">
              {profile?.name ? getInitials(profile.name) : "?"}
            </span>
          </div>
        )}
        <button
          onClick={() => onNavigate("groups")}
          className="flex-1 text-left text-sm text-muted-foreground bg-muted/40 hover:bg-muted/60 border border-border/30 rounded-full px-4 py-2.5 transition-all duration-200 hover:border-border/50"
        >
          Start a post or share an article...
        </button>
      </div>
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground gap-1.5 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
          onClick={() => onNavigate("groups")}
        >
          <FileText className="h-4 w-4" />
          <span className="font-medium">Post</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground gap-1.5 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
          onClick={() => onNavigate("groups")}
        >
          <Share2 className="h-4 w-4" />
          <span className="font-medium">Share</span>
        </Button>
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-card border border-border/40 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function FeedPage({
  onNavigate,
  onSelectGroup,
  onViewPublicProfile,
}: FeedPageProps) {
  const { data: profile } = useProfile();
  const { data: connections } = useConnections();
  const { data: feedPosts, isLoading, isError } = useFeedPosts();
  const { data: connectionRequests } = useConnectionRequests();

  const connectionCount = connections?.length ?? 0;
  const pendingCount =
    connectionRequests?.filter((r) => r.status === ConnStatus.Pending).length ??
    0;

  const sortedPosts = feedPosts
    ? [...feedPosts].sort((a, b) => Number(b.createdAt - a.createdAt))
    : [];

  const firstName = profile?.name ? getFirstName(profile.name) : "there";

  return (
    <>
      <div className="border-b border-border/40 bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-2xl font-bold text-foreground tracking-tight animate-fade-up">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 animate-fade-up-delay-1">
            Here&apos;s what&apos;s happening in your network
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        {/* Mobile-only: horizontal card strip for sidebar content */}
        <div className="flex md:hidden gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          <div className="min-w-[200px] max-w-[220px] shrink-0">
            <ProfileStrengthCard profile={profile} onNavigate={onNavigate} />
          </div>
          <div className="min-w-[180px] max-w-[200px] shrink-0">
            <NetworkActivityCard
              connectionCount={connectionCount}
              pendingCount={pendingCount}
              onNavigate={onNavigate}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-4">
            <CreatePostCard profile={profile} onNavigate={onNavigate} />

            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recent Updates
              </h2>

              {isLoading && <FeedSkeleton />}

              {isError && (
                <div className="text-destructive text-sm bg-card border border-destructive/20 rounded-xl p-4">
                  Failed to load feed.
                </div>
              )}

              {!isLoading && !isError && sortedPosts.length === 0 && (
                <div className="bg-card border border-border/40 rounded-xl px-8 py-20 flex flex-col items-center text-center gap-5 animate-card-in">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 via-chart-2/10 to-chart-4/10 flex items-center justify-center">
                    <Users2 className="h-8 w-8 text-primary/50" />
                  </div>
                  <div>
                    <p className="font-serif text-xl text-foreground">
                      Your feed is empty
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                      Join groups and connect with people to see posts in your
                      feed
                    </p>
                  </div>
                  <div className="flex gap-2.5 mt-1">
                    <Button
                      onClick={() => onNavigate("groups")}
                      className="shadow-sm shadow-primary/20 transition-all duration-200"
                    >
                      Browse Groups
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onNavigate("network")}
                      className="border-border/50 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-200"
                    >
                      Find People
                    </Button>
                  </div>
                </div>
              )}

              {!isLoading &&
                !isError &&
                sortedPosts.length > 0 &&
                sortedPosts.map((post) => (
                  <PostCard key={String(post.id)} post={post} />
                ))}
            </div>
          </div>

          <div className="hidden md:flex flex-col gap-4">
            <ProfileStrengthCard profile={profile} onNavigate={onNavigate} />
            <NetworkActivityCard
              connectionCount={connectionCount}
              pendingCount={pendingCount}
              onNavigate={onNavigate}
            />
            <SuggestedConnectionsCard
              onNavigate={onNavigate}
              onViewPublicProfile={onViewPublicProfile}
            />
          </div>
        </div>
      </div>
    </>
  );
}
