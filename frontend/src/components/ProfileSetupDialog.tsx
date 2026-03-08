import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSetProfile } from "../hooks/useQueries";

interface ProfileSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSetupDialog({
  open,
  onOpenChange,
}: ProfileSetupDialogProps) {
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");

  const { mutate: setProfile, isPending } = useSetProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (name.trim().length > 100) {
      setError("Name must be 100 characters or fewer.");
      return;
    }

    setError("");
    setProfile(
      {
        name: name.trim(),
        headline: headline.trim(),
        location: location.trim(),
        industry: "",
        bio: bio.trim(),
        skills: [],
        workHistory: [],
        education: [],
      },
      {
        onError: (err) => {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to save profile. Please try again.",
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to NetPro</DialogTitle>
          <DialogDescription>
            Set up your professional profile to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="setup-name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="setup-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Your full name"
              maxLength={100}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="setup-headline">Headline</Label>
            <Input
              id="setup-headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Software Engineer at Acme"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="setup-location">Location</Label>
            <Input
              id="setup-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="setup-bio">Bio</Label>
            <Textarea
              id="setup-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              rows={3}
              disabled={isPending}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full shadow-sm shadow-primary/20 active:scale-[0.98] transition-all duration-200"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Saving..." : "Get Started"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
