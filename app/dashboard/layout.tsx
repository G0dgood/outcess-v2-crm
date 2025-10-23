"use client";
import React from "react";
import { SetupProvider, useSetup } from "@/contexts/SetupContext";
import { toast } from "sonner";
import DashboardHeader from "@/components/ui/DashboardHeader";
import DashboardSideNav from "@/components/ui/DashboardSideNav";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { setupData } = useSetup();










  return (
    <div id="page-wrapper">
      <DashboardHeader
        companyName={setupData.companyName || 'Fairmoney'}
        userName="John Doe"
        userEmail="johndoe@example.com"
        isOnline={true}
        onCompanyChange={(company) => console.log('Company changed:', company)}
        onNotificationsClick={() => console.log('Notifications clicked')}
        onSettingsClick={() => console.log('Settings clicked')}
        onStatusClick={() => console.log('Status clicked')}
        onEditProfileClick={() => console.log('Edit profile clicked')}
        onLogoutClick={() => {
          console.log('Logout clicked');
          // Add logout logic here
        }}
      />

      <DashboardSideNav activeItem="dashboard" />
      <main>{children}</main>

    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SetupProvider>
      <LayoutContent>{children}</LayoutContent>
    </SetupProvider>
  );
}

export default Layout;
