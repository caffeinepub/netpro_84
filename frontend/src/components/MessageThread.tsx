import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Send,
  Paperclip,
  X,
  FileText,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useMessages, useSendMessage } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { UserName, UserAvatar } from "./UserDisplay";
import { fromNanoseconds, formatDateTime } from "../utils/formatting";
import { toast } from "sonner";

interface MessageThreadProps {
  partnerStr: string;
  onBack?: () => void;
}

export function MessageThread({ partnerStr, onBack }: MessageThreadProps) {
  const [body, setBody] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { identity } = useInternetIdentity();
  const ownPrincipal = identity?.getPrincipal().toString() ?? null;

  const { data: messages, isLoading, isError } = useMessages(partnerStr);
  const { mutate: sendMessage, isPending } = useSendMessage();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = body.trim();
    if ((!trimmed && !attachmentFile) || isPending) return;

    sendMessage(
      {
        to: partnerStr,
        body: trimmed,
        attachmentFile: attachmentFile ?? undefined,
        attachmentName: attachmentFile?.name,
      },
      {
        onSuccess: () => {
          setBody("");
          setAttachmentFile(null);
          textareaRef.current?.focus();
        },
        onError: () => {
          toast.error("Failed to send message");
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Attachment must be under 10MB.");
      return;
    }
    setAttachmentFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isImageType = (name: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/95 backdrop-blur-sm shrink-0">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-1 h-auto"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <UserAvatar principalStr={partnerStr} size="md" />
        <div className="flex-1 min-w-0">
          <UserName
            principalStr={partnerStr}
            className="text-sm font-semibold text-foreground truncate block"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 flex flex-col gap-3">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <div className="text-destructive text-sm text-center py-4">
            Failed to load messages.
          </div>
        )}

        {!isLoading && !isError && messages && messages.length === 0 && (
          <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
            No messages yet. Say hello!
          </div>
        )}

        {messages?.map((msg) => {
          const isOwn =
            ownPrincipal !== null && msg.from.toString() === ownPrincipal;
          const hasAttachment = !!msg.attachment;
          const attachName = msg.attachmentName ?? "Attachment";
          const isImage = hasAttachment && isImageType(attachName);

          return (
            <div
              key={msg.id.toString()}
              className={cn(
                "flex flex-col max-w-[75%]",
                isOwn ? "self-end items-end" : "self-start items-start",
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  isOwn
                    ? "bg-primary text-primary-foreground rounded-br-sm shadow-sm shadow-primary/25"
                    : "bg-muted text-foreground rounded-bl-sm shadow-xs",
                )}
              >
                {hasAttachment && (
                  <div className="mb-1.5">
                    {isImage ? (
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxUrl(msg.attachment!.getDirectURL())
                        }
                        className="block cursor-pointer"
                      >
                        <img
                          src={msg.attachment!.getDirectURL()}
                          alt={attachName}
                          className="max-w-full max-h-48 rounded-lg object-contain hover:opacity-90 transition-opacity"
                        />
                      </button>
                    ) : (
                      <a
                        href={msg.attachment!.getDirectURL()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-xs",
                          isOwn
                            ? "bg-primary-foreground/10 hover:bg-primary-foreground/20"
                            : "bg-background/60 hover:bg-background/80",
                        )}
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">{attachName}</span>
                        <Download className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    )}
                  </div>
                )}
                {msg.body && <span>{msg.body}</span>}
              </div>
              <span className="text-xs text-muted-foreground mt-1 px-1">
                {formatDateTime(fromNanoseconds(msg.createdAt))}
              </span>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Attachment preview */}
      {attachmentFile && (
        <div className="flex items-center gap-2 px-4 py-2 border-t border-border/30 bg-muted/30">
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-foreground truncate flex-1">
            {attachmentFile.name}
          </span>
          <button
            onClick={() => setAttachmentFile(null)}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-border/50 bg-card/95 backdrop-blur-sm shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          onChange={handleFileSelect}
          className="hidden"
        />
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send)"
          rows={1}
          className={cn(
            "flex-1 resize-none rounded-xl border border-input/60 bg-background px-3 py-2.5 text-sm",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40",
            "max-h-32 overflow-y-auto transition-all duration-200",
          )}
          style={{ minHeight: "40px" }}
          disabled={isPending}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={isPending || (!body.trim() && !attachmentFile)}
          className="shrink-0 h-10 w-10 shadow-sm shadow-primary/20 active:scale-[0.95] transition-all duration-200"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Dialog open={!!lightboxUrl} onOpenChange={() => setLightboxUrl(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 overflow-hidden border-border/50">
          {lightboxUrl && (
            <img
              src={lightboxUrl}
              alt="Attachment"
              className="max-w-full max-h-[85vh] object-contain mx-auto rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
