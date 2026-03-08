import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Users, Search, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useGroups,
  useMyGroups,
  useCreateGroup,
  useJoinGroup,
  useLeaveGroup,
} from "../hooks/useQueries";
import { INDUSTRIES } from "../utils/constants";

interface GroupsPageProps {
  onSelectGroup: (groupId: bigint) => void;
}

export function GroupsPage({ onSelectGroup }: GroupsPageProps) {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createIndustry, setCreateIndustry] = useState("");
  const [createError, setCreateError] = useState("");

  const [joiningId, setJoiningId] = useState<bigint | null>(null);
  const [leavingId, setLeavingId] = useState<bigint | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<bigint | null>(null);
  const [showGroupDetail, setShowGroupDetail] = useState(false);

  const {
    data: groups,
    isLoading: isGroupsLoading,
    isError: isGroupsError,
  } = useGroups();
  const {
    data: myGroups,
    isLoading: isMyGroupsLoading,
    isError: isMyGroupsError,
  } = useMyGroups();
  const { mutate: createGroup, isPending: isCreating } = useCreateGroup();
  const { mutate: joinGroup } = useJoinGroup();
  const { mutate: leaveGroup } = useLeaveGroup();

  const myGroupIds = new Set(myGroups?.map((g) => g.id.toString()) ?? []);

  const filteredGroups =
    groups?.filter(
      (g) =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.description.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  const selectedGroup = selectedGroupId
    ? myGroups?.find((g) => g.id === selectedGroupId)
    : (myGroups?.[0] ?? null);

  const handleCreateOpen = (open: boolean) => {
    setCreateOpen(open);
    if (open) {
      setCreateName("");
      setCreateDescription("");
      setCreateIndustry("");
      setCreateError("");
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (!createName.trim()) {
      setCreateError("Group name is required.");
      return;
    }
    createGroup(
      {
        name: createName.trim(),
        description: createDescription.trim(),
        industry: createIndustry,
      },
      {
        onSuccess: () => {
          toast.success("Group created!");
          setCreateOpen(false);
        },
        onError: (err) => {
          setCreateError(
            err instanceof Error ? err.message : "Failed to create group.",
          );
        },
      },
    );
  };

  const handleJoin = (groupId: bigint) => {
    setJoiningId(groupId);
    joinGroup(groupId, {
      onSuccess: () => {
        toast.success("Joined group.");
        setJoiningId(null);
      },
      onError: () => {
        toast.error("Failed to join group.");
        setJoiningId(null);
      },
    });
  };

  const handleLeave = (groupId: bigint) => {
    setLeavingId(groupId);
    leaveGroup(groupId, {
      onSuccess: () => {
        toast.success("Left group.");
        setLeavingId(null);
      },
      onError: () => {
        toast.error("Failed to leave group.");
        setLeavingId(null);
      },
    });
  };

  return (
    <>
      <div className="border-b border-border/40 bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Communities
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Join groups and engage with industry professionals
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <Tabs defaultValue="mygroups" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mygroups">
              My Groups
              <Badge variant="secondary" className="ml-2">
                {myGroups?.length ?? 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="discover">
              Discover
              <Badge variant="secondary" className="ml-2">
                {groups?.length ?? 0}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mygroups" className="space-y-4">
            {isMyGroupsError && (
              <p className="text-destructive text-sm">
                Failed to load your groups.
              </p>
            )}
            {isMyGroupsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : !myGroups || myGroups.length === 0 ? (
              <div className="py-16 text-center">
                <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-7 w-7 text-muted-foreground/40" />
                </div>
                <p className="font-serif text-lg text-foreground/70">
                  No groups yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Discover some communities to join!
                </p>
              </div>
            ) : (
              <>
                {/* Mobile: group detail view */}
                {showGroupDetail && selectedGroup && (
                  <div className="md:hidden space-y-4 animate-slide-up-fade">
                    <button
                      onClick={() => setShowGroupDetail(false)}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to groups
                    </button>
                    <Card className="border-border/40 overflow-hidden">
                      <div className="h-24 bg-gradient-to-br from-primary via-chart-4/60 to-chart-2/40 relative">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />
                      </div>
                      <CardContent className="pt-4 -mt-8 relative z-10">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-16 w-16 border-4 border-card shadow-md">
                            <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-chart-4 text-primary-foreground font-semibold">
                              {selectedGroup.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-foreground tracking-tight">
                              {selectedGroup.name}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                              {selectedGroup.description}
                            </p>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium mt-2">
                              <Users className="h-3.5 w-3.5" />
                              {selectedGroup.memberCount.toString()} members
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Button
                      onClick={() => onSelectGroup(selectedGroup.id)}
                      className="w-full shadow-sm shadow-primary/15 transition-all duration-200"
                    >
                      View Group Feed
                    </Button>
                  </div>
                )}

                <div
                  className={cn(
                    "grid md:grid-cols-3 gap-6",
                    showGroupDetail && "hidden md:grid",
                  )}
                >
                  <div className="md:col-span-1 space-y-2">
                    {myGroups.map((group) => (
                      <button
                        key={group.id.toString()}
                        onClick={() => {
                          setSelectedGroupId(group.id);
                          setShowGroupDetail(true);
                        }}
                        className={cn(
                          "w-full p-3 rounded-xl border text-left transition-all duration-200",
                          selectedGroup?.id === group.id
                            ? "border-primary/40 bg-primary/5 shadow-sm"
                            : "border-border/40 hover:border-primary/25 hover:bg-card",
                        )}
                      >
                        <div className="flex gap-3 items-start">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-chart-2/20 text-primary font-semibold text-sm">
                              {group.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate text-foreground">
                              {group.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {group.memberCount.toString()} members
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="hidden md:block md:col-span-2 space-y-4">
                    {selectedGroup ? (
                      <>
                        <Card className="border-border/40 overflow-hidden">
                          <div className="h-32 bg-gradient-to-br from-primary via-chart-4/60 to-chart-2/40 relative">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />
                          </div>
                          <CardContent className="pt-6 -mt-12 relative z-10">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-20 w-20 border-4 border-card shadow-md">
                                <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground font-semibold">
                                  {selectedGroup.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h2 className="text-xl font-bold text-foreground tracking-tight">
                                  {selectedGroup.name}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {selectedGroup.description}
                                </p>
                                <div className="flex items-center gap-4 mt-3">
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                                    <Users className="h-3.5 w-3.5" />
                                    {selectedGroup.memberCount.toString()}{" "}
                                    members
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Button
                          onClick={() => onSelectGroup(selectedGroup.id)}
                          className="w-full shadow-sm shadow-primary/15 transition-all duration-200"
                        >
                          View Group Feed
                        </Button>
                      </>
                    ) : (
                      <div className="py-16 text-center">
                        <p className="text-sm text-muted-foreground">
                          Select a group to see details
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="discover" className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search groups..."
                  className="pl-10 bg-muted/40 border-border/40 focus-visible:ring-primary/30"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                onClick={() => handleCreateOpen(true)}
                className="shadow-sm shadow-primary/15 transition-all duration-200"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Create Group
              </Button>
            </div>

            {isGroupsError && (
              <p className="text-destructive text-sm">Failed to load groups.</p>
            )}
            {isGroupsLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading groups...
              </div>
            )}
            {!isGroupsLoading && filteredGroups.length === 0 && (
              <div className="py-16 text-center">
                <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Search className="h-7 w-7 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">No groups found</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGroups.map((group) => {
                const isMember = myGroupIds.has(group.id.toString());
                return (
                  <Card
                    key={group.id.toString()}
                    className="border-border/40 overflow-hidden hover:shadow-md hover:border-border/60 transition-all duration-300"
                  >
                    <div className="h-20 bg-gradient-to-br from-primary/30 via-chart-4/15 to-chart-2/10" />
                    <CardContent className="pt-6 -mt-6 relative z-10">
                      <div className="flex gap-3 mb-3">
                        <Avatar className="h-14 w-14 border-4 border-card shadow-sm">
                          <AvatarFallback className="text-base bg-gradient-to-br from-primary to-chart-4 text-primary-foreground font-semibold">
                            {group.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {group.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {group.memberCount.toString()} members
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80 mb-3 line-clamp-2 leading-relaxed">
                        {group.description}
                      </p>
                      {group.industry && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 mb-3"
                        >
                          {group.industry}
                        </Badge>
                      )}
                      {isMember ? (
                        <Button
                          className="w-full shadow-sm shadow-primary/15 transition-all duration-200"
                          onClick={() => onSelectGroup(group.id)}
                        >
                          View Group
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full border-border/50 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-200"
                          onClick={() => handleJoin(group.id)}
                          disabled={joiningId === group.id}
                        >
                          {joiningId === group.id && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Join Group
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={createOpen} onOpenChange={handleCreateOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create a Group</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="group-name">Name</Label>
                <Input
                  id="group-name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Group name"
                  disabled={isCreating}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="group-description">Description</Label>
                <Textarea
                  id="group-description"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="What is this group about?"
                  rows={3}
                  disabled={isCreating}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Industry</Label>
                <Select
                  value={createIndustry}
                  onValueChange={setCreateIndustry}
                  disabled={isCreating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCreateOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isCreating ? "Creating..." : "Create Group"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
