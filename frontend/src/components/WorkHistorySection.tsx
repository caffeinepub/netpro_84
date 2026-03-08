import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import type { Profile, WorkEntry } from "../backend";
import { useSetProfile } from "../hooks/useQueries";

interface WorkHistorySectionProps {
  profile: Profile;
  isOwn: boolean;
}

interface WorkFormState {
  company: string;
  title: string;
  startYear: string;
  endYear: string;
  description: string;
}

const emptyForm = (): WorkFormState => ({
  company: "",
  title: "",
  startYear: "",
  endYear: "",
  description: "",
});

function entryToForm(entry: WorkEntry): WorkFormState {
  return {
    company: entry.company,
    title: entry.title,
    startYear: entry.startYear,
    endYear: entry.endYear,
    description: entry.description,
  };
}

export function WorkHistorySection({
  profile,
  isOwn,
}: WorkHistorySectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [form, setForm] = useState<WorkFormState>(emptyForm());
  const [formError, setFormError] = useState("");

  const { mutate: setProfile, isPending } = useSetProfile();

  const openAdd = () => {
    setEditingIndex(null);
    setForm(emptyForm());
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setForm(entryToForm(profile.workHistory[index]));
    setFormError("");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.company.trim() || !form.title.trim() || !form.startYear.trim()) {
      setFormError("Company, title, and start year are required.");
      return;
    }

    const newEntry: WorkEntry = {
      company: form.company.trim(),
      title: form.title.trim(),
      startYear: form.startYear.trim(),
      endYear: form.endYear.trim(),
      description: form.description.trim(),
    };

    let updatedHistory: WorkEntry[];
    if (editingIndex !== null) {
      updatedHistory = profile.workHistory.map((e, i) =>
        i === editingIndex ? newEntry : e,
      );
    } else {
      updatedHistory = [...profile.workHistory, newEntry];
    }

    setProfile(
      {
        name: profile.name,
        headline: profile.headline,
        location: profile.location,
        industry: profile.industry,
        bio: profile.bio,
        skills: profile.skills,
        workHistory: updatedHistory,
        education: profile.education,
      },
      {
        onSuccess: () => {
          toast.success(
            editingIndex !== null ? "Experience updated." : "Experience added.",
          );
          setDialogOpen(false);
        },
        onError: () => toast.error("Failed to save experience."),
      },
    );
  };

  const handleDelete = () => {
    if (deleteIndex === null) return;

    const updatedHistory = profile.workHistory.filter(
      (_, i) => i !== deleteIndex,
    );

    setProfile(
      {
        name: profile.name,
        headline: profile.headline,
        location: profile.location,
        industry: profile.industry,
        bio: profile.bio,
        skills: profile.skills,
        workHistory: updatedHistory,
        education: profile.education,
      },
      {
        onSuccess: () => {
          toast.success("Experience removed.");
          setDeleteIndex(null);
        },
        onError: () => toast.error("Failed to remove experience."),
      },
    );
  };

  if (profile.workHistory.length === 0 && !isOwn) return null;

  return (
    <div className="bg-card rounded-xl border border-border/50 p-5 space-y-3 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base tracking-tight">
          Work Experience
        </h3>
        {isOwn && (
          <Button
            size="sm"
            variant="outline"
            onClick={openAdd}
            className="gap-1 hover:bg-primary/5 hover:border-primary/30 active:scale-[0.97] transition-all duration-200"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        )}
      </div>

      {profile.workHistory.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No work experience added yet.
        </p>
      ) : (
        <div className="space-y-4">
          {profile.workHistory.map((entry, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{entry.title}</p>
                <p className="text-sm text-muted-foreground">{entry.company}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.startYear}
                  {entry.endYear ? ` – ${entry.endYear}` : " – Present"}
                </p>
                {entry.description && (
                  <p className="text-sm mt-1 text-foreground/80">
                    {entry.description}
                  </p>
                )}
              </div>
              {isOwn && (
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => openEdit(index)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setDeleteIndex(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!isPending) setDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null
                ? "Edit Experience"
                : "Add Work Experience"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="work-title">
                  Job Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="work-title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Software Engineer"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="work-company">
                  Company <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="work-company"
                  value={form.company}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, company: e.target.value }))
                  }
                  placeholder="Acme Corp"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="work-start">
                  Start Year <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="work-start"
                  value={form.startYear}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startYear: e.target.value }))
                  }
                  placeholder="2020"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="work-end">End Year</Label>
                <Input
                  id="work-end"
                  value={form.endYear}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endYear: e.target.value }))
                  }
                  placeholder="2024 (or leave blank)"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="work-description">Description</Label>
              <Textarea
                id="work-description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Describe your role and responsibilities..."
                rows={3}
                disabled={isPending}
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) setDeleteIndex(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove experience?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this work experience entry from your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
