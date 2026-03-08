import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePublicProfile } from "../hooks/useQueries";

function abbreviatePrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function UserName({
  principalStr,
  className,
}: {
  principalStr: string;
  className?: string;
}) {
  const { data: profile } = usePublicProfile(principalStr);
  return (
    <span className={className}>
      {profile?.name ?? abbreviatePrincipal(principalStr)}
    </span>
  );
}

export function UserHeadline({ principalStr }: { principalStr: string }) {
  const { data: profile } = usePublicProfile(principalStr);
  if (!profile?.headline) return null;
  return (
    <span className="text-xs text-muted-foreground truncate">
      {profile.headline}
    </span>
  );
}

export function UserAvatar({
  principalStr,
  size = "sm",
}: {
  principalStr: string;
  size?: "sm" | "md";
}) {
  const { data: profile } = usePublicProfile(principalStr);
  const name = profile?.name ?? abbreviatePrincipal(principalStr);
  const initials = profile?.name
    ? getInitials(profile.name)
    : principalStr.slice(0, 2).toUpperCase();
  const sizeClass = size === "md" ? "h-10 w-10" : "h-7 w-7";
  const textSize = size === "md" ? "text-sm" : "text-xs";

  return (
    <Avatar className={sizeClass}>
      <AvatarImage src={profile?.avatar?.getDirectURL() ?? undefined} />
      <AvatarFallback
        className={`${textSize} bg-gradient-to-br from-primary/15 to-chart-2/10 text-primary font-semibold`}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
