import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { INDUSTRIES, EXPERIENCE_LEVELS } from "../utils/constants";

interface JobSearchBarProps {
  keyword: string;
  location: string;
  industry: string;
  experienceLevel: string;
  onKeywordChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  onIndustryChange: (v: string) => void;
  onExperienceLevelChange: (v: string) => void;
}

export function JobSearchBar({
  keyword,
  location,
  industry,
  experienceLevel,
  onKeywordChange,
  onLocationChange,
  onIndustryChange,
  onExperienceLevelChange,
}: JobSearchBarProps) {
  const hasFilters = keyword || location || industry || experienceLevel;

  const handleClear = () => {
    onKeywordChange("");
    onLocationChange("");
    onIndustryChange("");
    onExperienceLevelChange("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search jobs..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="flex-1 min-w-[160px]"
        />
        <Input
          placeholder="Location"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="flex-1 min-w-[140px]"
        />
        <Select value={industry} onValueChange={onIndustryChange}>
          <SelectTrigger className="flex-1 min-w-[160px]">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind} value={ind}>
                {ind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={experienceLevel} onValueChange={onExperienceLevelChange}>
          <SelectTrigger className="flex-1 min-w-[160px]">
            <SelectValue placeholder="Experience Level" />
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
      {hasFilters && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
