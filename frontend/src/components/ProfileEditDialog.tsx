import { useState, useEffect, useRef } from "react";
import { Loader2, X, Upload, Trash2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import type { Profile } from "../backend";
import {
  useSetProfile,
  useSetAvatar,
  useRemoveAvatar,
  useSetResume,
  useRemoveResume,
} from "../hooks/useQueries";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function ProfileEditDialog({
  open,
  onOpenChange,
  profile,
}: ProfileEditDialogProps) {
  const [name, setName] = useState(profile.name);
  const [headline, setHeadline] = useState(profile.headline);
  const [location, setLocation] = useState(profile.location);
  const [industry, setIndustry] = useState(profile.industry ?? "");
  const [bio, setBio] = useState(profile.bio);
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [newSkill, setNewSkill] = useState("");
  const [nameError, setNameError] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const { mutate: setProfile, isPending } = useSetProfile();
  const { mutate: setAvatar, isPending: isUploadingAvatar } = useSetAvatar();
  const { mutate: removeAvatarMut, isPending: isRemovingAvatar } =
    useRemoveAvatar();
  const { mutate: setResume, isPending: isUploadingResume } = useSetResume();
  const { mutate: removeResumeMut, isPending: isRemovingResume } =
    useRemoveResume();

  const isMediaBusy =
    isUploadingAvatar ||
    isRemovingAvatar ||
    isUploadingResume ||
    isRemovingResume;

  useEffect(() => {
    if (open) {
      setName(profile.name);
      setHeadline(profile.headline);
      setLocation(profile.location);
      setIndustry(profile.industry ?? "");
      setBio(profile.bio);
      setSkills([...profile.skills]);
      setNewSkill("");
      setNameError("");
    }
  }, [open, profile]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error("Avatar must be under 1MB.");
      return;
    }
    setAvatar(
      { file },
      {
        onSuccess: () => toast.success("Avatar updated."),
        onError: () => toast.error("Failed to upload avatar."),
      },
    );
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleRemoveAvatar = () => {
    removeAvatarMut(undefined, {
      onSuccess: () => toast.success("Avatar removed."),
      onError: () => toast.error("Failed to remove avatar."),
    });
  };

  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error("Resume must be under 1MB.");
      return;
    }
    setResume(
      { file },
      {
        onSuccess: () => toast.success("Resume updated."),
        onError: () => toast.error("Failed to upload resume."),
      },
    );
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  };

  const handleRemoveResume = () => {
    removeResumeMut(undefined, {
      onSuccess: () => toast.success("Resume removed."),
      onError: () => toast.error("Failed to remove resume."),
    });
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills((prev) => [...prev, trimmed]);
    setNewSkill("");
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError("Name is required.");
      return;
    }
    if (name.trim().length > 100) {
      setNameError("Name must be 100 characters or fewer.");
      return;
    }

    setNameError("");

    setProfile(
      {
        name: name.trim(),
        headline: headline.trim(),
        location: location.trim(),
        industry: industry.trim(),
        bio: bio.trim(),
        skills,
        workHistory: profile.workHistory,
        education: profile.education,
      },
      {
        onSuccess: () => {
          toast.success("Profile updated.");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to update profile.",
          );
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!isPending && !isMediaBusy) onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="basic" className="flex-1">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex-1">
              Skills
            </TabsTrigger>
            <TabsTrigger value="media" className="flex-1">
              Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-3 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError("");
                }}
                maxLength={100}
                disabled={isPending}
              />
              {nameError && (
                <p className="text-sm text-destructive">{nameError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-headline">Headline</Label>
              <Input
                id="edit-headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Software Engineer at Acme"
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-industry">Industry</Label>
              <Input
                id="edit-industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Technology, Healthcare, Finance"
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people a bit about yourself..."
                rows={4}
                disabled={isPending}
              />
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-3 mt-4">
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No skills added yet.
                </p>
              ) : (
                skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="gap-1 text-sm"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      disabled={isPending}
                      aria-label={`Remove ${skill}`}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                disabled={isPending}
              />
              <Button
                variant="outline"
                onClick={handleAddSkill}
                disabled={isPending || !newSkill.trim()}
              >
                Add
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-border">
                  <AvatarImage
                    src={profile.avatar?.getDirectURL() ?? undefined}
                  />
                  <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/15 to-chart-2/10 text-primary">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isPending || isMediaBusy}
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {isUploadingAvatar ? "Uploading..." : "Upload"}
                  </Button>
                  {profile.avatar && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={isPending || isMediaBusy}
                      className="text-destructive hover:text-destructive"
                    >
                      {isRemovingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Max 1MB. JPG, PNG, or GIF.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Resume</Label>
              <div className="flex items-center gap-3">
                {profile.resume ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <a
                      href={profile.resume.getDirectURL()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary underline"
                    >
                      View resume
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No resume uploaded.
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={isPending || isMediaBusy}
                >
                  {isUploadingResume ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {isUploadingResume
                    ? "Uploading..."
                    : profile.resume
                      ? "Replace"
                      : "Upload"}
                </Button>
                {profile.resume && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveResume}
                    disabled={isPending || isMediaBusy}
                    className="text-destructive hover:text-destructive"
                  >
                    {isRemovingResume ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeSelect}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                Max 1MB. PDF, DOC, or DOCX.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="shadow-sm shadow-primary/20 active:scale-[0.97] transition-all duration-200"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
