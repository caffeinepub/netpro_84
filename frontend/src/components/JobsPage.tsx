import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Loader2,
  Plus,
  MapPin,
  DollarSign,
  Calendar,
  Briefcase,
  Pencil,
  XCircle,
  ArrowLeft,
  SlidersHorizontal,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useSearchJobs,
  useMyJobs,
  useMyApplications,
  useDeactivateJob,
  useJob,
} from "../hooks/useQueries";
import { PostJobDialog } from "./PostJobDialog";
import { ApplyDialog } from "./ApplyDialog";
import { ApplicationCard } from "./ApplicationCard";
import { JobApplicantsSection } from "./JobApplicantsSection";
import { fromNanoseconds, formatRelative } from "../utils/formatting";
import { INDUSTRIES, EXPERIENCE_LEVELS } from "../utils/constants";
import type { JobPosting } from "../backend";

interface JobsPageProps {
  onViewPublicProfile?: (principalStr: string) => void;
}

export function JobsPage({ onViewPublicProfile }: JobsPageProps) {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showJobDetail, setShowJobDetail] = useState(false);

  const [selectedJobId, setSelectedJobId] = useState<bigint | null>(null);
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [editJob, setEditJob] = useState<JobPosting | null>(null);
  const [applyJob, setApplyJob] = useState<JobPosting | null>(null);
  const [deactivateJob, setDeactivateJob] = useState<JobPosting | null>(null);

  const {
    data: searchResults,
    isLoading: isSearching,
    isError: isSearchError,
  } = useSearchJobs(keyword, location, industry, experienceLevel);
  const {
    data: myJobs,
    isLoading: isMyJobsLoading,
    isError: isMyJobsError,
  } = useMyJobs();
  const {
    data: myApplications,
    isLoading: isAppsLoading,
    isError: isAppsError,
  } = useMyApplications();
  const { data: selectedJob } = useJob(selectedJobId);
  const { mutate: deactivate, isPending: isDeactivating } = useDeactivateJob();

  const hasFilters = keyword || location || industry || experienceLevel;

  const handleDeactivateConfirm = () => {
    if (!deactivateJob) return;
    deactivate(deactivateJob.id, {
      onSuccess: () => {
        toast.success("Job deactivated.");
        setDeactivateJob(null);
      },
      onError: () => {
        toast.error("Failed to deactivate job.");
      },
    });
  };

  const clearFilters = () => {
    setKeyword("");
    setLocation("");
    setIndustry("");
    setExperienceLevel("");
  };

  return (
    <>
      <div className="border-b border-border/40 bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Job Opportunities
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Discover and apply to jobs that match your profile
            </p>
          </div>
          <Button
            onClick={() => setPostJobOpen(true)}
            size="sm"
            className="shadow-sm shadow-primary/15 transition-all duration-200 shrink-0"
          >
            <Plus className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Post Job</span>
            <span className="sm:hidden">Post</span>
          </Button>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <Tabs defaultValue="browse" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
            <TabsTrigger value="myjobs">
              My Jobs
              <Badge variant="secondary" className="ml-2">
                {myJobs?.length ?? 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="applications">
              Applications
              <Badge variant="secondary" className="ml-2">
                {myApplications?.length ?? 0}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {/* Mobile: collapsible filters */}
            <div className="md:hidden">
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card text-sm font-medium transition-all duration-200",
                  hasFilters && "border-primary/30 bg-primary/5",
                )}
              >
                <span className="flex items-center gap-2 text-foreground">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasFilters && (
                    <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                      Active
                    </Badge>
                  )}
                </span>
                <ChevronUp
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    !filtersOpen && "rotate-180",
                  )}
                />
              </button>
              {filtersOpen && (
                <div className="mt-2 p-4 bg-card border border-border/40 rounded-xl space-y-3 animate-slide-up-fade">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                        Search
                      </label>
                      <Input
                        placeholder="Title, company..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="bg-muted/40 border-border/40"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                        Location
                      </label>
                      <Input
                        placeholder="All Locations"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="bg-muted/40 border-border/40"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                        Industry
                      </label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger className="bg-muted/40 border-border/40">
                          <SelectValue placeholder="All Industries" />
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
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                        Experience
                      </label>
                      <Select
                        value={experienceLevel}
                        onValueChange={setExperienceLevel}
                      >
                        <SelectTrigger className="bg-muted/40 border-border/40">
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPERIENCE_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-border/50"
                    onClick={() => {
                      clearFilters();
                      setFiltersOpen(false);
                    }}
                    disabled={!hasFilters}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Desktop: inline filter grid */}
            <div className="hidden md:grid md:grid-cols-5 gap-3 mb-6 p-4 bg-card border border-border/40 rounded-xl">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Search
                </label>
                <Input
                  placeholder="Title, company..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="bg-muted/40 border-border/40"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Location
                </label>
                <Input
                  placeholder="All Locations"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-muted/40 border-border/40"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Industry
                </label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="bg-muted/40 border-border/40">
                    <SelectValue placeholder="All Industries" />
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
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Experience
                </label>
                <Select
                  value={experienceLevel}
                  onValueChange={setExperienceLevel}
                >
                  <SelectTrigger className="bg-muted/40 border-border/40">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                  &nbsp;
                </label>
                <Button
                  variant="outline"
                  className="w-full border-border/50"
                  onClick={clearFilters}
                  disabled={!hasFilters}
                >
                  Clear
                </Button>
              </div>
            </div>

            {isSearchError && (
              <p className="text-destructive text-sm">Failed to load jobs.</p>
            )}

            {/* Mobile: job detail overlay */}
            {showJobDetail && selectedJob && (
              <div className="md:hidden animate-slide-up-fade">
                <button
                  onClick={() => setShowJobDetail(false)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to results
                </button>
                <Card className="border-border/40">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-xl tracking-tight">
                          {selectedJob.title}
                        </CardTitle>
                        <CardDescription className="text-base mt-1 font-medium">
                          {selectedJob.company}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      {selectedJob.location && (
                        <div className="flex items-center gap-2.5 p-2.5 bg-muted/30 rounded-lg">
                          <MapPin className="h-4 w-4 text-primary/70 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                              Location
                            </p>
                            <p className="font-semibold text-sm truncate">
                              {selectedJob.location}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedJob.experienceLevel && (
                        <div className="flex items-center gap-2.5 p-2.5 bg-muted/30 rounded-lg">
                          <Briefcase className="h-4 w-4 text-primary/70 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                              Experience
                            </p>
                            <p className="font-semibold text-sm truncate">
                              {selectedJob.experienceLevel}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedJob.salaryRange && (
                        <div className="flex items-center gap-2.5 p-2.5 bg-muted/30 rounded-lg">
                          <DollarSign className="h-4 w-4 text-primary/70 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                              Salary
                            </p>
                            <p className="font-semibold text-sm truncate">
                              {selectedJob.salaryRange}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2.5 p-2.5 bg-muted/30 rounded-lg">
                        <Calendar className="h-4 w-4 text-primary/70 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                            Posted
                          </p>
                          <p className="font-semibold text-sm">
                            {formatRelative(
                              fromNanoseconds(selectedJob.createdAt),
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedJob.active && (
                      <Button
                        className="w-full shadow-sm shadow-primary/15 transition-all duration-200"
                        onClick={() => setApplyJob(selectedJob)}
                      >
                        Apply Now
                      </Button>
                    )}

                    {selectedJob.description && (
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          About the Role
                        </h3>
                        <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-sm">
                          {selectedJob.description}
                        </p>
                      </div>
                    )}

                    {selectedJob.requirements && (
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Requirements
                        </h3>
                        <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-sm">
                          {selectedJob.requirements}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {selectedJob.industry && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedJob.industry}
                        </Badge>
                      )}
                      {selectedJob.experienceLevel && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedJob.experienceLevel}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Job list / detail grid */}
            <div
              className={cn(
                "grid md:grid-cols-3 gap-6",
                showJobDetail && "hidden md:grid",
              )}
            >
              <div className="md:col-span-1 space-y-2">
                {isSearching && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </div>
                )}
                {!isSearching &&
                  searchResults &&
                  searchResults.length === 0 && (
                    <div className="py-20 text-center">
                      <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                        <Briefcase className="h-7 w-7 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No jobs found
                      </p>
                    </div>
                  )}
                {searchResults?.map((job) => (
                  <button
                    key={job.id.toString()}
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setShowJobDetail(true);
                    }}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all duration-200",
                      selectedJobId === job.id
                        ? "border-primary/40 bg-primary/5 shadow-sm"
                        : "border-border/40 hover:border-primary/25 hover:bg-card",
                    )}
                  >
                    <h3 className="font-semibold text-foreground truncate text-sm">
                      {job.title}
                    </h3>
                    <p className="text-sm text-primary/80 truncate font-medium">
                      {job.company}
                    </p>
                    {job.location && (
                      <p className="text-xs text-muted-foreground mt-1 truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </p>
                    )}
                    <div className="flex gap-1.5 mt-2">
                      {job.experienceLevel && (
                        <Badge variant="outline" className="text-[10px] px-1.5">
                          {job.experienceLevel}
                        </Badge>
                      )}
                      {!job.active && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5"
                        >
                          Closed
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="hidden md:block md:col-span-2">
                {selectedJob ? (
                  <Card className="border-border/40 animate-card-in">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl tracking-tight">
                            {selectedJob.title}
                          </CardTitle>
                          <CardDescription className="text-base mt-1 font-medium">
                            {selectedJob.company}
                          </CardDescription>
                        </div>
                        {selectedJob.active && (
                          <Button
                            onClick={() => setApplyJob(selectedJob)}
                            className="shadow-sm shadow-primary/15 transition-all duration-200"
                          >
                            Apply
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        {selectedJob.location && (
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <MapPin className="h-5 w-5 text-primary/70" />
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                Location
                              </p>
                              <p className="font-semibold text-sm">
                                {selectedJob.location}
                              </p>
                            </div>
                          </div>
                        )}
                        {selectedJob.experienceLevel && (
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Briefcase className="h-5 w-5 text-primary/70" />
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                Experience
                              </p>
                              <p className="font-semibold text-sm">
                                {selectedJob.experienceLevel}
                              </p>
                            </div>
                          </div>
                        )}
                        {selectedJob.salaryRange && (
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <DollarSign className="h-5 w-5 text-primary/70" />
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                Salary
                              </p>
                              <p className="font-semibold text-sm">
                                {selectedJob.salaryRange}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <Calendar className="h-5 w-5 text-primary/70" />
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                              Posted
                            </p>
                            <p className="font-semibold text-sm">
                              {formatRelative(
                                fromNanoseconds(selectedJob.createdAt),
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {selectedJob.description && (
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            About the Role
                          </h3>
                          <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-sm">
                            {selectedJob.description}
                          </p>
                        </div>
                      )}

                      {selectedJob.requirements && (
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Requirements
                          </h3>
                          <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-sm">
                            {selectedJob.requirements}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {selectedJob.industry && (
                          <Badge variant="secondary" className="text-xs">
                            {selectedJob.industry}
                          </Badge>
                        )}
                        {selectedJob.experienceLevel && (
                          <Badge variant="secondary" className="text-xs">
                            {selectedJob.experienceLevel}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="py-20 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select a job to view details
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="myjobs" className="space-y-4">
            {isMyJobsError && (
              <p className="text-destructive text-sm">
                Failed to load your jobs.
              </p>
            )}
            {isMyJobsLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            )}
            {!isMyJobsLoading && myJobs && myJobs.length === 0 && (
              <div className="py-16 text-center">
                <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="h-7 w-7 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  No jobs posted yet
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Start by creating your first job listing
                </p>
                <Button
                  onClick={() => setPostJobOpen(true)}
                  className="shadow-sm shadow-primary/15 transition-all duration-200"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Post Your First Job
                </Button>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {myJobs?.map((job) => (
                <Card key={job.id.toString()} className="border-border/40">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {job.title}
                        </h3>
                        <p className="text-sm text-primary/80 font-medium">
                          {job.company}
                        </p>
                        {job.location && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </p>
                        )}
                        <div className="flex gap-1.5 mt-2">
                          {job.industry && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5"
                            >
                              {job.industry}
                            </Badge>
                          )}
                          {job.experienceLevel && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5"
                            >
                              {job.experienceLevel}
                            </Badge>
                          )}
                          {!job.active && (
                            <Badge
                              variant="destructive"
                              className="text-[10px] px-1.5"
                            >
                              Closed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditJob(job);
                            setPostJobOpen(true);
                          }}
                          className="border-border/50 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-200"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        {job.active && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeactivateJob(job)}
                            className="border-border/50 hover:bg-destructive/5 hover:border-destructive/30 hover:text-destructive transition-all duration-200"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </div>
                    {onViewPublicProfile && (
                      <JobApplicantsSection
                        jobId={job.id}
                        onViewProfile={onViewPublicProfile}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            {isAppsError && (
              <p className="text-destructive text-sm">
                Failed to load your applications.
              </p>
            )}
            {isAppsLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            )}
            {!isAppsLoading &&
              myApplications &&
              myApplications.length === 0 && (
                <div className="py-16 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="h-7 w-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No applications yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Browse jobs and apply to get started
                  </p>
                </div>
              )}
            <div className="flex flex-col gap-3">
              {myApplications?.map((application) => (
                <ApplicationCard
                  key={application.id.toString()}
                  application={application}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <PostJobDialog
          open={postJobOpen}
          onOpenChange={(open) => {
            setPostJobOpen(open);
            if (!open) setEditJob(null);
          }}
          job={editJob ?? undefined}
        />

        {applyJob && (
          <ApplyDialog
            open={!!applyJob}
            onOpenChange={(open) => {
              if (!open) setApplyJob(null);
            }}
            job={applyJob}
          />
        )}

        <AlertDialog
          open={!!deactivateJob}
          onOpenChange={(open) => {
            if (!open) setDeactivateJob(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate job posting?</AlertDialogTitle>
              <AlertDialogDescription>
                This will close "{deactivateJob?.title}" and no new applications
                will be accepted. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeactivating}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeactivateConfirm}
                disabled={isDeactivating}
              >
                {isDeactivating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isDeactivating ? "Deactivating..." : "Deactivate"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
