import { useState } from "react";
import { MapPin, Globe, Pencil, Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile, useConnections, usePrincipal } from "../hooks/useQueries";
import { WorkHistorySection } from "./WorkHistorySection";
import { EducationSection } from "./EducationSection";
import { SkillsSection } from "./SkillsSection";
import { ProfileEditDialog } from "./ProfileEditDialog";

interface ProfilePageProps {
  onViewPublicProfile: (principalStr: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProfilePage({ onViewPublicProfile }: ProfilePageProps) {
  const [editOpen, setEditOpen] = useState(false);

  const { data: profile, isLoading, isError } = useProfile();
  const { data: connections } = useConnections();
  const principalStr = usePrincipal();

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
                  <Skeleton className="h-4 w-32" />
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
        <p className="text-destructive">Failed to load profile.</p>
      </div>
    );
  }

  if (!profile) return null;

  const connectionCount = connections?.length ?? 0;
  const skillCount = profile.skills?.length ?? 0;

  return (
    <>
      <div className="h-36 sm:h-52 bg-gradient-to-br from-primary via-chart-4/60 to-chart-2/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />
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
                <Button
                  onClick={() => setEditOpen(true)}
                  size="sm"
                  className="md:hidden shadow-sm shadow-primary/15 transition-all duration-200"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
              </div>

              <div className="flex-1">
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

                <div className="hidden md:flex flex-wrap gap-2.5 mt-5">
                  <Button
                    onClick={() => setEditOpen(true)}
                    className="shadow-sm shadow-primary/15 transition-all duration-200"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Edit Profile
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border/30">
                  <div className="text-center md:text-left">
                    <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
                      {connectionCount}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                      Connections
                    </p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
                      0
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                      Followers
                    </p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
                      {skillCount}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                      Skills
                    </p>
                  </div>
                </div>
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
              isOwn={true}
              principalStr={principalStr}
            />
          </TabsContent>

          <TabsContent value="experience">
            <WorkHistorySection profile={profile} isOwn={true} />
          </TabsContent>

          <TabsContent value="education">
            <EducationSection profile={profile} isOwn={true} />
          </TabsContent>
        </Tabs>
      </div>

      <ProfileEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={profile}
      />
    </>
  );
}
