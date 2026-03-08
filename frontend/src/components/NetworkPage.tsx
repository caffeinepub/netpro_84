import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  useConnections,
  useConnectionRequests,
  useSentRequests,
  useConnectionSuggestions,
} from "../hooks/useQueries";
import { ConnStatus } from "../backend";
import type { Profile } from "../backend";
import { ConnectionCard } from "./ConnectionCard";
import { PendingRequestsSection } from "./PendingRequestsSection";
import { SuggestionsSection } from "./SuggestionsSection";
import { SentRequestCard } from "./SentRequestCard";
import { Loader2, Users, Search, Send } from "lucide-react";

interface NetworkPageProps {
  onViewProfile: (principalStr: string) => void;
  onNavigateToMessages?: (principalStr: string) => void;
}

export function NetworkPage({
  onViewProfile,
  onNavigateToMessages,
}: NetworkPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const {
    data: connections,
    isLoading: connectionsLoading,
    isError: connectionsError,
  } = useConnections();
  const { data: requests } = useConnectionRequests();
  const { data: sentRequests } = useSentRequests();
  const { data: suggestions } = useConnectionSuggestions();

  const pendingCount =
    requests?.filter((r) => r.status === ConnStatus.Pending).length ?? 0;
  const connectionCount = connections?.length ?? 0;
  const sentCount =
    sentRequests?.filter((r) => r.status === ConnStatus.Pending).length ?? 0;
  const suggestionsCount = suggestions?.length ?? 0;

  const filteredConnections = useMemo(() => {
    if (!connections || !searchQuery.trim()) return connections ?? [];
    const query = searchQuery.toLowerCase();
    return connections.filter((principal) => {
      const principalStr = principal.toString();
      const profile = queryClient.getQueryData<Profile | null>([
        "publicProfile",
        principalStr,
      ]);
      if (!profile) return principalStr.toLowerCase().includes(query);
      return (
        profile.name.toLowerCase().includes(query) ||
        (profile.headline?.toLowerCase().includes(query) ?? false) ||
        (profile.location?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [connections, searchQuery, queryClient]);

  return (
    <>
      <div className="border-b border-border/40 bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            My Network
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your connections and grow your network
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <Tabs defaultValue="connections">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger
              value="connections"
              className="gap-1 text-xs sm:text-sm px-1 sm:px-3"
            >
              <span className="hidden sm:inline">Connections</span>
              <span className="sm:hidden">Conns</span>
              <Badge
                variant="secondary"
                className={cn(
                  "ml-0.5 sm:ml-1 h-5 min-w-5 px-1 sm:px-1.5 text-[10px] sm:text-xs font-medium",
                  connectionCount === 0 && "opacity-50",
                )}
              >
                {connectionCount}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="requests"
              className="gap-1 text-xs sm:text-sm px-1 sm:px-3"
            >
              Pending
              <Badge
                variant={pendingCount > 0 ? "destructive" : "secondary"}
                className="ml-0.5 sm:ml-1 h-5 min-w-5 px-1 sm:px-1.5 text-[10px] sm:text-xs font-medium"
              >
                {pendingCount}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="sent"
              className="gap-1 text-xs sm:text-sm px-1 sm:px-3"
            >
              Sent
              <Badge
                variant="secondary"
                className={cn(
                  "ml-0.5 sm:ml-1 h-5 min-w-5 px-1 sm:px-1.5 text-[10px] sm:text-xs font-medium",
                  sentCount === 0 && "opacity-50",
                )}
              >
                {sentCount}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="suggestions"
              className="gap-1 text-xs sm:text-sm px-1 sm:px-3"
            >
              <span className="hidden sm:inline">Discover</span>
              <span className="sm:hidden">Find</span>
              <Badge
                variant="secondary"
                className={cn(
                  "ml-0.5 sm:ml-1 h-5 min-w-5 px-1 sm:px-1.5 text-[10px] sm:text-xs font-medium",
                  suggestionsCount === 0 && "opacity-50",
                )}
              >
                {suggestionsCount}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search connections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/40 border-border/40 focus-visible:ring-primary/30"
                />
              </div>
            </div>

            {connectionsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : connectionsError ? (
              <div className="text-destructive text-sm py-8 text-center">
                Failed to load connections.
              </div>
            ) : !filteredConnections || filteredConnections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center">
                  <Users className="h-7 w-7 opacity-40" />
                </div>
                <div className="text-center">
                  <p className="font-serif text-lg text-foreground/70">
                    {searchQuery.trim()
                      ? "No connections match your search"
                      : "No connections yet"}
                  </p>
                  {!searchQuery.trim() && (
                    <p className="text-xs mt-1">
                      Check the Discover tab to start building your network.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredConnections.map((principal) => {
                  const principalStr = principal.toString();
                  return (
                    <ConnectionCard
                      key={principalStr}
                      principalStr={principalStr}
                      onViewProfile={onViewProfile}
                      onNavigateToMessages={onNavigateToMessages}
                      showRemoveButton
                      showMessageButton
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests">
            <PendingRequestsSection />
          </TabsContent>

          <TabsContent value="sent">
            {!sentRequests ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : sentRequests.filter((r) => r.status === ConnStatus.Pending)
                .length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center">
                  <Send className="h-7 w-7 opacity-40" />
                </div>
                <div className="text-center">
                  <p className="font-serif text-lg text-foreground/70">
                    No sent requests
                  </p>
                  <p className="text-xs mt-1">
                    Connection requests you send will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sentRequests
                  .filter((r) => r.status === ConnStatus.Pending)
                  .map((request) => {
                    const toStr = request.to.toString();
                    return (
                      <SentRequestCard
                        key={request.id.toString()}
                        principalStr={toStr}
                      />
                    );
                  })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions">
            <SuggestionsSection onViewProfile={onViewProfile} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
