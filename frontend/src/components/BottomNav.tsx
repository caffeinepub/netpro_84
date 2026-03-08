import { Home, Users, Briefcase, MessageSquare, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  unreadMessages: number;
  unreadNotifs: number;
}

const navItems = [
  { id: "feed", label: "Home", Icon: Home },
  { id: "network", label: "Network", Icon: Users },
  { id: "jobs", label: "Jobs", Icon: Briefcase },
  { id: "messages", label: "Messages", Icon: MessageSquare },
  { id: "notifications", label: "Alerts", Icon: Bell },
];

export function BottomNav({
  currentPage,
  onNavigate,
  unreadMessages,
  unreadNotifs,
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border/30 flex sm:hidden pb-safe shadow-[0_-1px_8px_0_rgb(0_0_0/0.04)]">
      {navItems.map(({ id, label, Icon }) => {
        const isActive = currentPage === id;
        const badgeCount =
          id === "messages"
            ? unreadMessages
            : id === "notifications"
              ? unreadNotifs
              : 0;

        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-all duration-200 active:scale-90",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
            )}
            <div className="relative">
              <Icon
                className={cn(
                  "h-[22px] w-[22px] transition-all duration-200",
                  isActive && "stroke-[2.5]",
                )}
              />
              {badgeCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 h-[18px] min-w-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center shadow-sm shadow-destructive/20 ring-2 ring-card">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-[10px] leading-none transition-all duration-200",
                isActive ? "font-semibold text-primary" : "font-medium",
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
