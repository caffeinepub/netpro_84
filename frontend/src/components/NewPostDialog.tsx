import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreatePost } from "../hooks/useQueries";
import { PostType } from "../backend";
import type { PostTypeStr } from "../utils/constants";

interface NewPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: bigint;
}

const POST_TYPE_OPTIONS: { label: string; value: PostTypeStr }[] = [
  { label: "Article", value: "Article" },
  { label: "Question", value: "Question" },
  { label: "Insight", value: "Insight" },
];

function toPostType(str: PostTypeStr): PostType {
  switch (str) {
    case "Article":
      return PostType.Article;
    case "Question":
      return PostType.Question;
    case "Insight":
      return PostType.Insight;
  }
}

export function NewPostDialog({
  open,
  onOpenChange,
  groupId,
}: NewPostDialogProps) {
  const [postTypeStr, setPostTypeStr] = useState<PostTypeStr>("Article");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const { mutate: createPost, isPending } = useCreatePost();

  useEffect(() => {
    if (open) {
      setPostTypeStr("Article");
      setBody("");
      setError("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (body.trim().length < 10) {
      setError("Post must be at least 10 characters.");
      return;
    }
    createPost(
      {
        groupId,
        body: body.trim(),
        postType: toPostType(postTypeStr),
      },
      {
        onSuccess: () => {
          toast.success("Post created.");
          onOpenChange(false);
        },
        onError: (err) => {
          setError(
            err instanceof Error ? err.message : "Failed to create post.",
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>Post Type</Label>
            <div className="flex gap-2">
              {POST_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPostTypeStr(opt.value)}
                  disabled={isPending}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200 active:scale-[0.97]",
                    postTypeStr === opt.value
                      ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                      : "border-border/50 bg-background hover:bg-accent/40 hover:border-border",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-body">Content</Label>
            <Textarea
              id="post-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share something with the group..."
              rows={5}
              disabled={isPending}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="shadow-sm shadow-primary/20 active:scale-[0.97] transition-all duration-200"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Posting..." : "Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
