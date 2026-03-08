import { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Globe,
  Loader2,
  MoreHorizontal,
  MessageSquare,
  UserPlus,
  Clock,
  Building2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  usePublicProfile,
  useConnections,
  useSentRequests,
  useSendConnectionRequest,
  useBlockUser,
} from "../hooks/useQueries";
import { ConnStatus } from "../backend";
import { WorkHistorySection } from "./WorkHistorySection";
import { EducationSection } from "./EducationSection";
import { SkillsSection } from "./SkillsSection";

interface PublicProfilePageProps {
  principalStr: string;
  onBack: () => void;
  onNavigateToMessages?: (principalStr: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PublicProfilePage({
  principalStr,
  onBack,
  onNavigateToMessages,
}: PublicProfilePageProps) {
  const { data: profile, isLoading, isError } = usePublicProfile(principalStr);
  const { data: connections } = useConnections();
  const { data: sentRequests } = useSentRequests();
  const { mutate: sendConnectionRequest, isPending: isSending } =
    useSendConnectionRequest();
  const { mutate: blockUser, isPending: isBlocking } = useBlockUser();

  const isConnected =
    connections?.some((p) => p.toString() === principalStr) ?? false;
  const hasPendingRequest =
    sentRequests?.some(
      (r) =>
        r.to.toString() === principalStr && r.status === ConnStatus.Pending,
    ) ?? false;

  const handleConnect = () => {
    sendConnectionRequest(principalStr, {
      onSuccess: () => toast.success("Connection request sent."),
      onError: () => toast.error("Failed to send connection request."),
    });
  };

  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);

  const handleBlockConfirm = () => {
    blockUser(principalStr, {
      onSuccess: () => {
        toast.success("User blocked.");
        setBlockConfirmOpen(false);
        onBack();
      },
      onError: () => toast.error("Failed to block user."),
    });
  };

  if (isLoading) {
    return (
      <div>
        <div className="h-52 bg-gradient-to-br from-primary via-chart-4/60 to-chart-2/40" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-12 relative z-10">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-6">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-5 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <p className="text-destructive">Failed to load profile.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <p className="text-muted-foreground">
          Profile not found or not visible.
        </p>
      </div>
    );
  }

  const skillCount = profile.skills?.length ?? 0;

  return (
    <>
      <div className="h-36 sm:h-52 bg-gradient-to-br from-primary via-chart-4/60 to-chart-2/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5 text-primary-foreground hover:text-primary-foreground/90 hover:bg-primary-foreground/10 backdrop-blur-sm transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 sm:-mt-20 pb-24 md:pb-12 relative z-10">
        <Card className="mb-6 border-border/40 shadow-md animate-card-in">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
              <div className="shrink-0 flex items-start justify-between">
                <Avatar className="h-20 w-20 sm:h-32 sm:w-32 border-4 border-card shadow-lg ring-4 ring-background">
                  <AvatarImage
                    src={profile.avatar?.getDirectURL() ?? undefined}
                  />
                  <AvatarFallback className="text-xl sm:text-2xl font-semibold bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="md:hidden text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setBlockConfirmOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      Block User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                      {profile.name}
                    </h1>
                    {profile.headline && (
                      <p className="text-sm sm:text-base text-primary/80 mt-0.5 sm:mt-1 font-medium">
                        {profile.headline}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3">
                      {profile.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {profile.location}
                        </div>
                      )}
                      {profile.industry && (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                          {profile.industry}
                        </div>
                      )}
                      {profile.resume && (
                        <a
                          href={profile.resume.getDirectURL()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:text-primary transition-colors duration-200"
                        >
                          <Globe className="h-3.5 w-3.5 shrink-0" />
                          Resume
                        </a>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hidden md:flex text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setBlockConfirmOpen(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        Block User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {isConnected ? (
                    <>
                      {onNavigateToMessages && (
                        <Button
                          onClick={() => onNavigateToMessages(principalStr)}
                          className="shadow-sm shadow-primary/15 transition-all duration-200"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      )}
                    </>
                  ) : hasPendingRequest ? (
                    <Button
                      disabled
                      variant="outline"
                      className="border-amber-200/60 bg-amber-50 text-amber-700 hover:bg-amber-50 cursor-default"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Request Pending
                    </Button>
                  ) : (
                    <Button
                      onClick={handleConnect}
                      disabled={isSending}
                      className="shadow-sm shadow-primary/15 transition-all duration-200"
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      {isSending ? "Sending..." : "Connect"}
                    </Button>
                  )}
                </div>

                {skillCount > 0 && (
                  <div className="mt-6 pt-6 border-t border-border/30">
                    <p className="text-sm text-muted-foreground">
                      <span className="text-lg font-bold text-foreground tabular-nums">
                        {skillCount}
                      </span>{" "}
                      <span className="text-xs uppercase tracking-wider font-medium">
                        {skillCount === 1 ? "skill" : "skills"}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {profile.bio && (
              <div className="mt-6 pt-6 border-t border-border/30">
                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="skills" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="skills"
              className="text-xs sm:text-sm px-1 sm:px-3"
            >
              <span className="hidden sm:inline">Skills & Endorsements</span>
              <span className="sm:hidden">Skills</span>
            </TabsTrigger>
            <TabsTrigger
              value="experience"
              className="text-xs sm:text-sm px-1 sm:px-3"
            >
              Experience
            </TabsTrigger>
            <TabsTrigger
              value="education"
              className="text-xs sm:text-sm px-1 sm:px-3"
            >
              Education
            </TabsTrigger>
          </TabsList>

          <TabsContent value="skills">
            <SkillsSection
              profile={profile}
              isOwn={false}
              principalStr={principalStr}
            />
          </TabsContent>

          <TabsContent value="experience">
            <WorkHistorySection profile={profile} isOwn={false} />
          </TabsContent>

          <TabsContent value="education">
            <EducationSection profile={profile} isOwn={false} />
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={blockConfirmOpen} onOpenChange={setBlockConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {profile.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They won&apos;t be able to see your profile, send you messages, or
              connect with you. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBlocking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockConfirm}
              disabled={isBlocking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBlocking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isBlocking ? "Blocking..." : "Block"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
