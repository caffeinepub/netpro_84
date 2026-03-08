import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useComments, useAddComment } from "../hooks/useQueries";
import { UserName, UserAvatar } from "./UserDisplay";
import { fromNanoseconds, formatRelative } from "../utils/formatting";

interface CommentsSectionProps {
  postId: bigint;
}

function abbreviatePrincipal(principal: string): string {
  if (principal.length <= 16) return principal;
  return `${principal.slice(0, 8)}...${principal.slice(-4)}`;
}

function getInitials(principal: string): string {
  return principal.slice(0, 2).toUpperCase();
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const [commentText, setCommentText] = useState("");

  const { data: comments, isLoading, isError } = useComments(postId);
  const { mutate: addComment, isPending } = useAddComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(
      { postId, body: commentText.trim() },
      {
        onSuccess: () => {
          setCommentText("");
        },
        onError: () => {
          toast.error("Failed to add comment.");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-3 pt-2 border-t border-border/50">
      {isError && (
        <p className="text-destructive text-xs">Failed to load comments.</p>
      )}
      {isLoading && (
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading comments...
        </div>
      )}
      {comments && comments.length > 0 && (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => {
            const principalStr = comment.authorPrincipal.toString();
            return (
              <div key={comment.id.toString()} className="flex gap-2">
                <div className="flex-shrink-0">
                  <UserAvatar principalStr={principalStr} size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <UserName
                      principalStr={principalStr}
                      className="text-xs font-medium"
                    />
                    <span className="text-xs text-muted-foreground">
                      {formatRelative(fromNanoseconds(comment.createdAt))}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5">{comment.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          disabled={isPending}
          className="flex-1 h-8 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !commentText.trim()}
          className="shadow-sm shadow-primary/15 active:scale-[0.97] transition-all duration-200"
        >
          {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          Comment
        </Button>
      </form>
    </div>
  );
}
