import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Users, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import {
  useGroupPosts,
  useGroups,
  useMyGroups,
  useJoinGroup,
  useLeaveGroup,
  useProfile,
} from "../hooks/useQueries";
import { PostCard } from "./PostCard";
import { NewPostDialog } from "./NewPostDialog";

interface GroupFeedPageProps {
  groupId: bigint;
  onBack: () => void;
}

export function GroupFeedPage({ groupId, onBack }: GroupFeedPageProps) {
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [isJoiningLocal, setIsJoiningLocal] = useState(false);
  const [isLeavingLocal, setIsLeavingLocal] = useState(false);

  const {
    data: posts,
    isLoading: isPostsLoading,
    isError: isPostsError,
  } = useGroupPosts(groupId);
  const { data: allGroups } = useGroups();
  const { data: myGroups } = useMyGroups();
  const { data: profile } = useProfile();
  const { mutate: joinGroup } = useJoinGroup();
  const { mutate: leaveGroup } = useLeaveGroup();

  const group = allGroups?.find((g) => g.id === groupId);
  const isMember = myGroups?.some((g) => g.id === groupId) ?? false;

  const handleJoin = () => {
    setIsJoiningLocal(true);
    joinGroup(groupId, {
      onSuccess: () => {
        toast.success("Joined group.");
        setIsJoiningLocal(false);
      },
      onError: () => {
        toast.error("Failed to join group.");
        setIsJoiningLocal(false);
      },
    });
  };

  const handleLeave = () => {
    setIsLeavingLocal(true);
    leaveGroup(groupId, {
      onSuccess: () => {
        toast.success("Left group.");
        setIsLeavingLocal(false);
      },
      onError: () => {
        toast.error("Failed to leave group.");
        setIsLeavingLocal(false);
      },
    });
  };

  const isMembershipPending = isJoiningLocal || isLeavingLocal;

  return (
    <>
      <div className="border-b border-border/40 bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5 -ml-2 hover:bg-accent transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </Button>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6 space-y-4">
        <Card className="border-border/40 overflow-hidden animate-card-in">
          <div className="h-32 bg-gradient-to-br from-primary via-chart-4/60 to-chart-2/40 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />
          </div>
          <CardContent className="pt-6 -mt-12 relative z-10">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 border-4 border-card shadow-md">
                <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground font-semibold">
                  {group?.name?.charAt(0) ?? "G"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  {group?.name ?? `Group ${groupId.toString()}`}
                </h2>
                {group?.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {group.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  {group && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                      <Users className="h-3.5 w-3.5" />
                      {group.memberCount.toString()} members
                    </span>
                  )}
                  {group?.industry && (
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      {group.industry}
                    </Badge>
                  )}
                </div>
                <div className="mt-3">
                  {isMember ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleLeave}
                      disabled={isMembershipPending}
                      className="border-border/50 hover:bg-destructive/5 hover:border-destructive/30 hover:text-destructive transition-all duration-200"
                    >
                      {isLeavingLocal && (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      )}
                      Leave
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleJoin}
                      disabled={isMembershipPending}
                      className="shadow-sm shadow-primary/15 transition-all duration-200"
                    >
                      {isJoiningLocal && (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      )}
                      Join
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10 ring-2 ring-border/20 ring-offset-2 ring-offset-card">
                <AvatarFallback className="bg-gradient-to-br from-primary to-chart-4 text-primary-foreground font-semibold text-sm">
                  {profile?.name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div
                  className="bg-muted/30 border border-border/30 rounded-xl p-3 cursor-pointer hover:bg-muted/50 hover:border-border/40 transition-all duration-200"
                  onClick={() => setNewPostOpen(true)}
                >
                  <p className="text-muted-foreground text-sm">
                    What's on your mind?
                  </p>
                </div>
                <div className="flex justify-end mt-3">
                  <Button
                    onClick={() => setNewPostOpen(true)}
                    className="shadow-sm shadow-primary/15 transition-all duration-200"
                  >
                    <Send className="h-4 w-4 mr-1.5" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isPostsError && (
          <p className="text-destructive text-sm">Failed to load posts.</p>
        )}
        {isPostsLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading posts...
          </div>
        )}
        {!isPostsLoading && posts && posts.length === 0 && (
          <div className="py-12 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Send className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="font-serif text-lg text-foreground/70">
              No posts yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Be the first to share!
            </p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {posts?.map((post) => (
            <PostCard key={post.id.toString()} post={post} />
          ))}
        </div>

        <NewPostDialog
          open={newPostOpen}
          onOpenChange={setNewPostOpen}
          groupId={groupId}
        />
      </div>
    </>
  );
}
