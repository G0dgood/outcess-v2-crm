"use client";
import React, { useState, useEffect, Suspense } from "react";
import { SetupProvider } from "@/contexts/SetupContext";
import DashboardHeader from "@/components/ui/DashboardHeader";
import DashboardSideNav from "@/components/ui/DashboardSideNav";
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
    <div id="page-wrapper" className={isMobileMenuOpen ? 'mobile-nav-open' : ''}>
      <OfflineBanner />
      <DashboardHeader
				companyName={lineOfBusinessData?.companyName || ''}
				onMobileMenuToggle={toggleMobileMenu}
				isMobileMenuOpen={isMobileMenuOpen}
			/>

      {/* Desktop SideNav */}
      <Suspense fallback={null}>
        <DashboardSideNav
          activeItem="dashboard"
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />
      </Suspense>

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
