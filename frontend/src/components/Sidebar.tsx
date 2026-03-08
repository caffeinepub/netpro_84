import {
  Home,
  Users,
  MessageSquare,
  Briefcase,
  Users2,
  Bell,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useProfile } from "../hooks/useQueries";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const navItems = [
  { id: "feed", icon: Home, label: "Feed" },
  { id: "network", icon: Users, label: "Connections" },
  { id: "messages", icon: MessageSquare, label: "Messages" },
  { id: "jobs", icon: Briefcase, label: "Jobs" },
  { id: "groups", icon: Users2, label: "Groups" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "profile", icon: User, label: "Profile" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  const { data: profile } = useProfile();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border/40 bg-card h-screen fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center shadow-sm shadow-primary/25">
            <Briefcase className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              NetPro
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
              Network
            </p>
          </div>
        </div>
      </div>

      {profile && (
        <div className="p-4 mx-3 mt-4 rounded-xl border border-border/40 bg-gradient-to-br from-primary/[0.03] to-chart-2/[0.06]">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 ring-2 ring-primary/15 ring-offset-2 ring-offset-card">
              <AvatarImage src={profile.avatar?.getDirectURL() ?? undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-chart-4 text-primary-foreground font-semibold text-sm">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">
                {profile.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile.headline}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={cn(
                "w-full flex items-center gap-3 h-10 px-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              onClick={() => onNavigate(item.id)}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  !isActive &&
                    "group-hover:scale-105 transition-transform duration-200",
                )}
              />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border/40 space-y-0.5">
        <button
          className="w-full flex items-center gap-3 h-9 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
          onClick={() => onNavigate("settings")}
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm">Settings</span>
        </button>
        <button
          className="w-full flex items-center gap-3 h-9 px-3 rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/5 transition-all duration-200"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
