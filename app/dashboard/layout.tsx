"use client";
import React, { useState, useEffect, Suspense } from "react";
import { SetupProvider, useSetup } from "@/contexts/SetupContext";
import DashboardHeader from "@/components/ui/DashboardHeader";
import DashboardSideNav from "@/components/ui/DashboardSideNav";
import MobileSideNav from "@/components/ui/MobileSideNav";
import OfflineBanner from "@/components/ui/OfflineBanner";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { setupData } = useSetup();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobileView(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);










  return (
    <div id="page-wrapper">
      <OfflineBanner />
      <DashboardHeader
        companyName={setupData.companyName || 'Fairmoney'}
        userName="John Doe"
        userEmail="johndoe@example.com"
        userIsOnline={true}
        onCompanyChange={(company) => console.log('Company changed:', company)}
        onSettingsClick={() => console.log('Settings clicked')}
        onStatusClick={() => console.log('Status clicked')}
        onEditProfileClick={() => console.log('Edit profile clicked')}
        onMobileMenuToggle={toggleMobileMenu}
      />

      {/* Desktop SideNav */}
      <Suspense fallback={null}>
        <DashboardSideNav
          activeItem="dashboard"
          isMobileOpen={false}
          onMobileClose={() => { }}
        />
      </Suspense>

      {/* Mobile SideNav - only render on mobile viewports */}
      {isMobileView && (
        <Suspense fallback={null}>
          <MobileSideNav
            activeItem="dashboard"
            isOpen={isMobileMenuOpen}
            onClose={closeMobileMenu}
          />
        </Suspense>
      )}

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
