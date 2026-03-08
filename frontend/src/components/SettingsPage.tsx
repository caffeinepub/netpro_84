import { Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrivacySettingsSection } from "./PrivacySettingsSection";
import { BlockedUsersSection } from "./BlockedUsersSection";

export function SettingsPage() {
  return (
    <>
      <div className="border-b border-border/40 bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Settings
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <div className="bg-card border border-border/40 rounded-xl p-6">
          <Tabs defaultValue="privacy">
            <TabsList className="mb-6">
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="blocked">Blocked Users</TabsTrigger>
            </TabsList>

            <TabsContent value="privacy">
              <PrivacySettingsSection />
            </TabsContent>

            <TabsContent value="blocked">
              <BlockedUsersSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
