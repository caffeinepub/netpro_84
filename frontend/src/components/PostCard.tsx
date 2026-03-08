import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreVertical,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useToggleLike, useDeletePost, useGroups } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { CommentsSection } from "./CommentsSection";
import { UserName, UserHeadline, UserAvatar } from "./UserDisplay";
import {
  fromNanoseconds,
  formatRelative,
  formatPostType,
} from "../utils/formatting";
import { PostType } from "../backend";
import type { GroupPost } from "../backend";

interface PostCardProps {
  post: GroupPost;
  onDelete?: () => void;
}

const BODY_TRUNCATE_LENGTH = 200;

function postTypeBadgeVariant(postType: PostType): string {
  switch (postType) {
    case PostType.Article:
      return "bg-primary/8 text-primary border-primary/20";
    case PostType.Question:
      return "bg-amber-500/8 text-amber-700 border-amber-200";
    case PostType.Insight:
      return "bg-emerald-500/8 text-emerald-700 border-emerald-200";
    default:
      return "";
  }
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { identity } = useInternetIdentity();
  const { mutate: toggleLike, isPending: isLiking } = useToggleLike();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const { data: groups } = useGroups();
  const groupName = groups?.find((g) => g.id === post.groupId)?.name;

  const authorPrincipalStr = post.authorPrincipal.toString();
  const currentPrincipalStr = identity?.getPrincipal().toString() ?? "";
  const isOwnPost =
    !!currentPrincipalStr && authorPrincipalStr === currentPrincipalStr;

  const body = post.body;
  const isLong = body.length > BODY_TRUNCATE_LENGTH;
  const displayedBody =
    isLong && !expanded ? body.slice(0, BODY_TRUNCATE_LENGTH) + "..." : body;

  const postTypeLabel = formatPostType(post.postType);
  const badgeClass = postTypeBadgeVariant(post.postType);

  const handleLike = () => {
    toggleLike(post.id, {
      onError: () => toast.error("Failed to toggle like."),
    });
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#post-${post.id.toString()}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copied to clipboard."),
      () => toast.error("Failed to copy link."),
    );
  };

  const handleDelete = () => {
    deletePost(
      { postId: post.id, groupId: post.groupId },
      {
        onSuccess: () => {
          toast.success("Post deleted.");
          setDeleteOpen(false);
          onDelete?.();
        },
        onError: () => {
          toast.error("Failed to delete post.");
        },
      },
    );
  };

  return (
    <div
      id={`post-${post.id.toString()}`}
      className="rounded-xl border border-border/40 bg-card p-5 flex flex-col gap-3.5 hover:shadow-sm transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <UserAvatar principalStr={authorPrincipalStr} size="md" />
          <div className="flex flex-col min-w-0">
            <UserName
              principalStr={authorPrincipalStr}
              className="text-sm font-semibold truncate"
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              <UserHeadline principalStr={authorPrincipalStr} />
              {groupName && (
                <>
                  <span className="text-[11px] text-muted-foreground/70">
                    in
                  </span>
                  <span className="text-[11px] font-medium text-primary/80">
                    {groupName}
                  </span>
                </>
              )}
              <span className="text-[11px] text-muted-foreground/60">
                {formatRelative(fromNanoseconds(post.createdAt))}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("text-[10px] font-medium px-2 py-0.5", badgeClass)}
          >
            {postTypeLabel}
          </Badge>
          {isOwnPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div>
        <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
          {displayedBody}
        </p>
        {isLong && (
          <button
            className="text-xs font-medium text-primary hover:text-primary/80 mt-1.5 transition-colors duration-200"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      <div className="flex items-center border-t border-border/30 pt-2.5 -mx-1">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 active:bg-primary/10 rounded-lg transition-all duration-200"
          onClick={handleLike}
          disabled={isLiking}
        >
          <ThumbsUp className="h-4 w-4" />
          <span className="text-xs font-semibold tabular-nums">
            {post.likeCount.toString()}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex-1 gap-1.5 rounded-lg transition-all duration-200",
            showComments
              ? "text-primary bg-primary/8"
              : "text-muted-foreground hover:text-primary hover:bg-primary/5 active:bg-primary/10",
          )}
          onClick={() => setShowComments((v) => !v)}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-xs font-medium">Comment</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 active:bg-primary/10 rounded-lg transition-all duration-200"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          <span className="text-xs font-medium">Share</span>
        </Button>
      </div>

      {showComments && <CommentsSection postId={post.id} />}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
