import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Profile } from "../backend";
import {
  useSetProfile,
  useAddEndorsement,
  useEndorsements,
} from "../hooks/useQueries";

interface SkillsSectionProps {
  profile: Profile;
  isOwn: boolean;
  principalStr?: string;
}

export function SkillsSection({
  profile,
  isOwn,
  principalStr,
}: SkillsSectionProps) {
  const [newSkill, setNewSkill] = useState("");
  const [addingSkill, setAddingSkill] = useState(false);
  const [endorsingSkill, setEndorsingSkill] = useState<string | null>(null);

  const { mutate: setProfile, isPending: isSavingProfile } = useSetProfile();
  const { mutate: addEndorsement, isPending: isEndorsing } =
    useAddEndorsement();
  const { data: endorsements } = useEndorsements(principalStr ?? null);

  const getEndorsementCount = (skill: string): number => {
    if (!endorsements) return 0;
    return endorsements.filter((e) => e.skill === skill).length;
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (profile.skills.includes(trimmed)) {
      toast.error("Skill already added.");
      return;
    }

    setProfile(
      {
        name: profile.name,
        headline: profile.headline,
        location: profile.location,
        industry: profile.industry,
        bio: profile.bio,
        skills: [...profile.skills, trimmed],
        workHistory: profile.workHistory,
        education: profile.education,
      },
      {
        onSuccess: () => {
          setNewSkill("");
          setAddingSkill(false);
          toast.success("Skill added.");
        },
        onError: () => toast.error("Failed to add skill."),
      },
    );
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile(
      {
        name: profile.name,
        headline: profile.headline,
        location: profile.location,
        industry: profile.industry,
        bio: profile.bio,
        skills: profile.skills.filter((s) => s !== skill),
        workHistory: profile.workHistory,
        education: profile.education,
      },
      {
        onSuccess: () => toast.success("Skill removed."),
        onError: () => toast.error("Failed to remove skill."),
      },
    );
  };

  const handleEndorse = (skill: string) => {
    if (!principalStr) return;
    setEndorsingSkill(skill);
    addEndorsement(
      { target: principalStr, skill },
      {
        onSuccess: () => {
          toast.success(`Endorsed ${skill}.`);
          setEndorsingSkill(null);
        },
        onError: () => {
          toast.error("Failed to add endorsement.");
          setEndorsingSkill(null);
        },
      },
    );
  };

  if (profile.skills.length === 0 && !isOwn) return null;

  return (
    <div className="bg-card rounded-xl border border-border/50 p-5 space-y-3 shadow-xs">
      <h3 className="font-semibold text-base tracking-tight">Skills</h3>

      {profile.skills.length === 0 ? (
        <p className="text-sm text-muted-foreground">No skills added yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill) => {
            const count = getEndorsementCount(skill);
            return (
              <div key={skill} className="flex items-center gap-1">
                <Badge variant="secondary" className="text-sm">
                  {skill}
                  {count > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {count}
                    </span>
                  )}
                  {isOwn && (
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      disabled={isSavingProfile}
                      className="ml-1.5 hover:text-destructive transition-colors"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
                {!isOwn && principalStr && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    disabled={isEndorsing && endorsingSkill === skill}
                    onClick={() => handleEndorse(skill)}
                  >
                    {isEndorsing && endorsingSkill === skill ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Endorse"
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isOwn && (
        <div className="pt-1">
          {addingSkill ? (
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g. React, Leadership"
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSkill();
                  if (e.key === "Escape") {
                    setAddingSkill(false);
                    setNewSkill("");
                  }
                }}
                autoFocus
                disabled={isSavingProfile}
              />
              <Button
                size="sm"
                onClick={handleAddSkill}
                disabled={isSavingProfile || !newSkill.trim()}
              >
                {isSavingProfile ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setAddingSkill(false);
                  setNewSkill("");
                }}
                disabled={isSavingProfile}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddingSkill(true)}
              className={cn(
                "gap-1 hover:bg-primary/5 hover:border-primary/30 active:scale-[0.97] transition-all duration-200",
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Skill
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
