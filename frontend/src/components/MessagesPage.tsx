import { useEffect, useState } from "react";
import { MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMarkMessagesRead, useUnreadCount } from "../hooks/useQueries";
import { ConversationList } from "./ConversationList";
import { MessageThread } from "./MessageThread";

interface MessagesPageProps {
  initialPartner?: string | null;
}

export function MessagesPage({ initialPartner }: MessagesPageProps) {
  const [selectedPartner, setSelectedPartner] = useState<string | null>(
    initialPartner ?? null,
  );
  const [showThread, setShowThread] = useState(!!initialPartner);
  const [searchFilter, setSearchFilter] = useState("");
  const { mutate: markMessagesRead } = useMarkMessagesRead();
  const { data: unreadMessages } = useUnreadCount();

  const unreadCount = Number(unreadMessages ?? 0);

  useEffect(() => {
    if (selectedPartner) {
      markMessagesRead(selectedPartner);
    }
  }, [selectedPartner, markMessagesRead]);

  const handleSelectPartner = (principalStr: string) => {
    setSelectedPartner(principalStr);
    setShowThread(true);
  };

  const handleBack = () => {
    setShowThread(false);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-7.5rem)] sm:h-[calc(100dvh-3.5rem)] md:h-[100dvh] overflow-hidden">
      <div className="border-b border-border/40 bg-card/80 backdrop-blur-xl shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Messages
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`
              : "Your direct conversations"}
          </p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div
          className={cn(
            "w-full md:w-80 border-r border-border/40 flex flex-col bg-card shrink-0",
            showThread ? "hidden md:flex" : "flex",
          )}
        >
          <div className="p-4 border-b border-border/30">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 bg-muted/40 border-border/40 focus-visible:ring-primary/30"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              selectedPartner={selectedPartner}
              onSelectPartner={handleSelectPartner}
              searchFilter={searchFilter}
            />
          </div>
        </div>

        <div
          className={cn(
            "flex-1 flex flex-col bg-background min-h-0",
            showThread ? "flex" : "hidden md:flex",
          )}
        >
          {selectedPartner ? (
            <MessageThread partnerStr={selectedPartner} onBack={handleBack} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <h2 className="font-serif text-xl text-foreground/80 mb-1">
                  Select a conversation
                </h2>
                <p className="text-sm text-muted-foreground">
                  Choose a person to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
