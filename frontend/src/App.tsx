import { useState } from "react";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useActor } from "./hooks/useActor";
import {
  useProfile,
  useUnreadCount,
  useUnreadNotificationsCount,
} from "./hooks/useQueries";
import { LandingPage } from "./components/LandingPage";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { ProfileSetupDialog } from "./components/ProfileSetupDialog";
import { FeedPage } from "./components/FeedPage";
import { ProfilePage } from "./components/ProfilePage";
import { NetworkPage } from "./components/NetworkPage";
import { MessagesPage } from "./components/MessagesPage";
import { JobsPage } from "./components/JobsPage";
import { GroupsPage } from "./components/GroupsPage";
import { GroupFeedPage } from "./components/GroupFeedPage";
import { NotificationsPage } from "./components/NotificationsPage";
import { SettingsPage } from "./components/SettingsPage";
import { PublicProfilePage } from "./components/PublicProfilePage";

type Page =
  | "feed"
  | "profile"
  | "network"
  | "messages"
  | "jobs"
  | "groups"
  | "group"
  | "notifications"
  | "settings"
  | "publicProfile";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

interface AuthenticatedAppProps {
  onLogout: () => void;
}

function AuthenticatedApp({ onLogout }: AuthenticatedAppProps) {
  const [page, setPage] = useState<Page>("feed");
  const [selectedGroupId, setSelectedGroupId] = useState<bigint | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
  const [messageTarget, setMessageTarget] = useState<string | null>(null);

  const [profileSetupDismissed, setProfileSetupDismissed] = useState(false);

  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { data: unreadMessages } = useUnreadCount();
  const { data: unreadNotifs } = useUnreadNotificationsCount();

  const unreadMsgCount = Number(unreadMessages ?? 0);
  const unreadNotifCount = Number(unreadNotifs ?? 0);
  const userProfile = profile
    ? { name: profile.name, avatarUrl: profile.avatar?.getDirectURL() ?? "" }
    : null;

  const handleSelectGroup = (groupId: bigint) => {
    setSelectedGroupId(groupId);
    setPage("group");
  };

  const handleViewPublicProfile = (principalStr: string) => {
    setSelectedProfileId(principalStr);
    setPage("publicProfile");
  };

  const handleNavigateToMessages = (principalStr: string) => {
    setMessageTarget(principalStr);
    setPage("messages");
  };

  const handleNavigate = (newPage: string) => {
    if (newPage === "messages") {
      setMessageTarget(null);
    }
    setPage(newPage as Page);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        currentPage={page}
        onNavigate={handleNavigate}
        onLogout={onLogout}
      />
      <Header
        currentPage={page}
        onNavigate={handleNavigate}
        onLogout={onLogout}
        unreadMessages={unreadMsgCount}
        unreadNotifs={unreadNotifCount}
        userProfile={userProfile}
        onViewPublicProfile={handleViewPublicProfile}
      />
      <main className="flex-1 min-w-0 md:ml-64 pt-14 md:pt-0 pb-16 sm:pb-0 overflow-x-hidden">
        {page === "feed" && (
          <FeedPage
            onNavigate={handleNavigate}
            onSelectGroup={handleSelectGroup}
            onViewPublicProfile={handleViewPublicProfile}
          />
        )}
        {page === "profile" && (
          <ProfilePage onViewPublicProfile={handleViewPublicProfile} />
        )}
        {page === "network" && (
          <NetworkPage
            onViewProfile={handleViewPublicProfile}
            onNavigateToMessages={handleNavigateToMessages}
          />
        )}
        {page === "messages" && <MessagesPage initialPartner={messageTarget} />}
        {page === "jobs" && (
          <JobsPage onViewPublicProfile={handleViewPublicProfile} />
        )}
        {page === "groups" && <GroupsPage onSelectGroup={handleSelectGroup} />}
        {page === "group" && selectedGroupId !== null && (
          <GroupFeedPage
            groupId={selectedGroupId}
            onBack={() => setPage("groups")}
          />
        )}
        {page === "notifications" && (
          <NotificationsPage onNavigate={handleNavigate} />
        )}
        {page === "settings" && <SettingsPage />}
        {page === "publicProfile" && selectedProfileId !== null && (
          <PublicProfilePage
            principalStr={selectedProfileId}
            onBack={() => setPage("network")}
            onNavigateToMessages={handleNavigateToMessages}
          />
        )}
      </main>
      <BottomNav
        currentPage={page}
        onNavigate={handleNavigate}
        unreadMessages={unreadMsgCount}
        unreadNotifs={unreadNotifCount}
      />
      <ProfileSetupDialog
        open={!profile && !isLoadingProfile && !profileSetupDismissed}
        onOpenChange={(open) => {
          if (!open) setProfileSetupDismissed(true);
        }}
      />
      <Toaster position="top-center" />
    </div>
  );
}

export default function App() {
  const { identity, login, clear, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const { actor, isFetching } = useActor();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LandingPage onLogin={login} isLoggingIn={isLoggingIn} />;
  }

  if (!actor || isFetching) {
    return <LoadingSpinner />;
  }

  return (
    <AuthenticatedApp
      key={identity.getPrincipal().toString()}
      onLogout={clear}
    />
  );
}
