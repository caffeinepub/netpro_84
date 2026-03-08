import { useState, useRef, useEffect } from "react";
import { Briefcase, Search, LogOut, Settings, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useSearchUsers } from "../hooks/useQueries";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  unreadMessages: number;
  unreadNotifs: number;
  userProfile: { name: string; avatarUrl: string } | null;
  onViewPublicProfile: (principalStr: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function Header({
  currentPage,
  onNavigate,
  onLogout,
  userProfile,
  onViewPublicProfile,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults } = useSearchUsers(searchQuery);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
        setSearchExpanded(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchExpanded]);

  const handleSelectResult = (principalStr: string) => {
    setSearchQuery("");
    setShowSearch(false);
    setSearchExpanded(false);
    onViewPublicProfile(principalStr);
  };

  const handleCloseSearch = () => {
    setSearchQuery("");
    setShowSearch(false);
    setSearchExpanded(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border/30 md:hidden shadow-[0_1px_8px_0_rgb(0_0_0/0.04)]">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo - hide when search is expanded on mobile */}
        <button
          onClick={() => onNavigate("feed")}
          className={cn(
            "flex items-center gap-2 shrink-0",
            searchExpanded && "hidden sm:flex",
          )}
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center shadow-sm shadow-primary/20">
            <Briefcase className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-base hidden sm:block tracking-tight">
            NetPro
          </span>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search area */}
        <div
          className={cn(
            "flex items-center shrink-0 transition-all duration-200",
            searchExpanded && "flex-1",
          )}
          ref={searchRef}
        >
          {!searchExpanded ? (
            <button
              onClick={() => setSearchExpanded(true)}
              className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors duration-200"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
          ) : (
            <div className="relative w-full animate-slide-up-fade">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearch(true);
                }}
                onFocus={() => setShowSearch(true)}
                placeholder="Search people..."
                className="pl-9 pr-9 h-9 bg-muted/50 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-full"
              />
              <button
                onClick={handleCloseSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="h-4 w-4" />
              </button>

              {showSearch && searchQuery.length >= 2 && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border/60 rounded-xl shadow-lg overflow-hidden z-50 animate-slide-up-fade">
                  {!searchResults || searchResults.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                      No results found
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.principal.toString()}
                          onClick={() =>
                            handleSelectResult(user.principal.toString())
                          }
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent/60 active:bg-accent transition-colors text-left"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.avatar?.getDirectURL() ?? undefined}
                            />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {user.name}
                            </p>
                            {user.headline && (
                              <p className="text-xs text-muted-foreground truncate">
                                {user.headline}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar dropdown - hide when search is expanded on mobile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 shrink-0",
                searchExpanded && "hidden sm:flex",
              )}
            >
              <Avatar className="h-8 w-8 ring-1 ring-border/40">
                <AvatarImage src={userProfile?.avatarUrl} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                  {userProfile ? getInitials(userProfile.name) : "?"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onNavigate("profile")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate("settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
