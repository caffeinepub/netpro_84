import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { Profile, EducationEntry } from "../backend";
import { useSetProfile } from "../hooks/useQueries";

interface EducationSectionProps {
  profile: Profile;
  isOwn: boolean;
}

interface EduFormState {
  school: string;
  degree: string;
  field: string;
  year: string;
}

const emptyForm = (): EduFormState => ({
  school: "",
  degree: "",
  field: "",
  year: "",
});

function entryToForm(entry: EducationEntry): EduFormState {
  return {
    school: entry.school,
    degree: entry.degree,
    field: entry.field,
    year: entry.year,
  };
}

export function EducationSection({ profile, isOwn }: EducationSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [form, setForm] = useState<EduFormState>(emptyForm());
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
    setForm(entryToForm(profile.education[index]));
    setFormError("");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.school.trim() || !form.degree.trim()) {
      setFormError("School and degree are required.");
      return;
    }

    const newEntry: EducationEntry = {
      school: form.school.trim(),
      degree: form.degree.trim(),
      field: form.field.trim(),
      year: form.year.trim(),
    };

    let updatedEducation: EducationEntry[];
    if (editingIndex !== null) {
      updatedEducation = profile.education.map((e, i) =>
        i === editingIndex ? newEntry : e,
      );
    } else {
      updatedEducation = [...profile.education, newEntry];
    }

    setProfile(
      {
        name: profile.name,
        headline: profile.headline,
        location: profile.location,
        industry: profile.industry,
        bio: profile.bio,
        skills: profile.skills,
        workHistory: profile.workHistory,
        education: updatedEducation,
      },
      {
        onSuccess: () => {
          toast.success(
            editingIndex !== null ? "Education updated." : "Education added.",
          );
          setDialogOpen(false);
        },
        onError: () => toast.error("Failed to save education."),
      },
    );
  };

  const handleDelete = () => {
    if (deleteIndex === null) return;

    const updatedEducation = profile.education.filter(
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
        workHistory: profile.workHistory,
        education: updatedEducation,
      },
      {
        onSuccess: () => {
          toast.success("Education removed.");
          setDeleteIndex(null);
        },
        onError: () => toast.error("Failed to remove education."),
      },
    );
  };

  if (profile.education.length === 0 && !isOwn) return null;

  return (
    <div className="bg-card rounded-xl border border-border/50 p-5 space-y-3 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base tracking-tight">Education</h3>
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

      {profile.education.length === 0 ? (
        <p className="text-sm text-muted-foreground">No education added yet.</p>
      ) : (
        <div className="space-y-4">
          {profile.education.map((entry, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{entry.school}</p>
                <p className="text-sm text-muted-foreground">
                  {entry.degree}
                  {entry.field ? `, ${entry.field}` : ""}
                </p>
                {entry.year && (
                  <p className="text-xs text-muted-foreground">{entry.year}</p>
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
              {editingIndex !== null ? "Edit Education" : "Add Education"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edu-school">
                School <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edu-school"
                value={form.school}
                onChange={(e) =>
                  setForm((f) => ({ ...f, school: e.target.value }))
                }
                placeholder="University of California, Berkeley"
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edu-degree">
                  Degree <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edu-degree"
                  value={form.degree}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, degree: e.target.value }))
                  }
                  placeholder="B.S."
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edu-field">Field of Study</Label>
                <Input
                  id="edu-field"
                  value={form.field}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, field: e.target.value }))
                  }
                  placeholder="Computer Science"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edu-year">Year</Label>
              <Input
                id="edu-year"
                value={form.year}
                onChange={(e) =>
                  setForm((f) => ({ ...f, year: e.target.value }))
                }
                placeholder="2022"
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
            <AlertDialogTitle>Remove education?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this education entry from your profile.
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
