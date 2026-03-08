import { Loader2, Users } from "lucide-react";
import { useConnectionSuggestions } from "../hooks/useQueries";
import { ConnectionCard } from "./ConnectionCard";

interface SuggestionsSectionProps {
  onViewProfile: (principalStr: string) => void;
}

export function SuggestionsSection({ onViewProfile }: SuggestionsSectionProps) {
  const { data: suggestions, isLoading, isError } = useConnectionSuggestions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive text-sm py-8 text-center">
        Failed to load suggestions.
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <Users className="h-10 w-10 opacity-30" />
        <p className="text-sm">No suggestions available right now.</p>
        <p className="text-xs">
          Check back later as more professionals join NetPro.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {suggestions.map((user) => {
        const principalStr = user.principal.toString();
        return (
          <ConnectionCard
            key={principalStr}
            principalStr={principalStr}
            onViewProfile={onViewProfile}
            showConnectButton
          />
        );
      })}
    </div>
  );
}
