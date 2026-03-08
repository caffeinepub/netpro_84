import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useUpdatePrivacySettings, useProfile } from "../hooks/useQueries";
import { ProfileVisibility } from "../backend";

type VisibilityKind = "Public" | "ConnectionsOnly";

function visibilityToKind(v: ProfileVisibility): VisibilityKind {
  return v as VisibilityKind;
}

function kindToVisibility(kind: VisibilityKind): ProfileVisibility {
  if (kind === "Public") return ProfileVisibility.Public;
  return ProfileVisibility.ConnectionsOnly;
}

export function PrivacySettingsSection() {
  const { data: profile } = useProfile();
  const { mutate: updatePrivacy, isPending } = useUpdatePrivacySettings();

  const [selected, setSelected] = useState<VisibilityKind>("Public");

  useEffect(() => {
    if (profile?.profileVisibility) {
      setSelected(visibilityToKind(profile.profileVisibility));
    }
  }, [profile?.profileVisibility]);

  const handleSave = () => {
    updatePrivacy(kindToVisibility(selected), {
      onSuccess: () => {
        toast.success("Privacy settings saved");
      },
      onError: () => {
        toast.error("Failed to save privacy settings");
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Profile Visibility
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Control who can view your profile.
        </p>
        <RadioGroup
          value={selected}
          onValueChange={(val) => setSelected(val as VisibilityKind)}
          className="space-y-3"
        >
          <div className="flex items-start gap-3 p-3 border border-border/50 rounded-xl hover:bg-accent/30 hover:border-border transition-all duration-200 cursor-pointer">
            <RadioGroupItem
              value="Public"
              id="visibility-public"
              className="mt-0.5"
            />
            <Label
              htmlFor="visibility-public"
              className="cursor-pointer flex-1"
            >
              <span className="font-medium text-sm block">Public</span>
              <span className="text-xs text-muted-foreground">
                Everyone can see your profile
              </span>
            </Label>
          </div>
          <div className="flex items-start gap-3 p-3 border border-border/50 rounded-xl hover:bg-accent/30 hover:border-border transition-all duration-200 cursor-pointer">
            <RadioGroupItem
              value="ConnectionsOnly"
              id="visibility-connections"
              className="mt-0.5"
            />
            <Label
              htmlFor="visibility-connections"
              className="cursor-pointer flex-1"
            >
              <span className="font-medium text-sm block">
                Connections Only
              </span>
              <span className="text-xs text-muted-foreground">
                Only your connections can see your profile
              </span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Button
        onClick={handleSave}
        disabled={isPending}
        size="sm"
        className="shadow-sm shadow-primary/20 active:scale-[0.97] transition-all duration-200"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
