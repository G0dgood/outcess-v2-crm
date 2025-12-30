"use client";
import React, { useState, useEffect, Suspense } from "react";
import { SetupProvider } from "@/contexts/SetupContext";
import DashboardHeader from "@/components/ui/DashboardHeader";
import DashboardSideNav from "@/components/ui/DashboardSideNav";
import MobileSideNav from "@/components/ui/MobileSideNav";
import OfflineBanner from "@/components/ui/OfflineBanner";
import { useLineOfBusiness } from "@/contexts/LineOfBusinessContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { lineOfBusinessData } = useLineOfBusiness();
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
        companyName={lineOfBusinessData?.companyName || ''}
        userIsOnline={true}
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
