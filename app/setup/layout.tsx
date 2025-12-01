"use client";
import BottomNav from "@/components/ui/BottomNav";
import SetupHeader from "@/components/ui/SetupHeader";
import SetupSidebar from "@/components/ui/SetupSidebar";
import React, { useRef, useState, useEffect } from "react";
import { SetupProvider, useSetup } from "@/contexts/SetupContext";
import { toast } from "sonner";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { currentStep, isLoading, setIsLoading, onStepComplete, onStepBack, setupData } = useSetup();
  const saveTimeoutRef = useRef<number | null>(null);
  const submitTimeoutRef = useRef<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const drawerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobileView(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      // Validate Basic Setup
      if (!setupData.companyName.trim() || !setupData.timeZone || !setupData.industry || !setupData.businessSize) {
        return false;
      }
    }
    // Add validation for other steps as needed
    return true;
  };

  const handleBack = () => {
    if (currentStep > 1) {
      onStepBack();
      toast.info("Returned to previous step", {
        description: "You can modify your previous settings.",
        duration: 2000,
      });
    }
  };

  const getBackButtonText = () => {
    switch (currentStep) {
      case 2: return "Back to Basic Setup";
      case 3: return "Back to Header & Navigation";
      case 4: return "Back to Dashboard";
      case 5: return "Back to Customer Book";
      case 6: return "Back to User Management";
      default: return "Back";
    }
  };

  const handleSave = () => {
    if (currentStep === 6) {
      // Final step - submit for approval
      handleSubmitForApproval();
      return;
    }

    if (!validateCurrentStep()) {
      toast.error("Please fill in all required fields before continuing.", {
        description: "Complete all marked fields to proceed to the next step.",
        duration: 4000,
      });
      return;
    }

    setIsLoading(true);
    toast.loading("Saving your progress...", {
      id: "save-progress",
      action: {
        label: "Cancel",
        onClick: () => {
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
          }
          setIsLoading(false);
          toast.dismiss("save-progress");
        }
      }
    });

    // Simulate save operation
    saveTimeoutRef.current = window.setTimeout(() => {
      setIsLoading(false);
      toast.success("Step completed successfully!", {
        id: "save-progress",
        description: "Moving to the next step...",
        duration: 2000,
      });
      onStepComplete(); // Move to next step
    }, 1500);
  };

  const handleSubmitForApproval = () => {
    setIsLoading(true);
    toast.loading("Submitting for approval...", {
      id: "submit-progress",
      action: {
        label: "Cancel",
        onClick: () => {
          if (submitTimeoutRef.current) {
            clearTimeout(submitTimeoutRef.current);
            submitTimeoutRef.current = null;
          }
          setIsLoading(false);
          toast.dismiss("submit-progress");
        }
      }
    });

    // Simulate submission
    submitTimeoutRef.current = window.setTimeout(() => {
      console.log('CRM configuration submitted for approval:', setupData);
      setIsLoading(false);
      toast.success("Configuration submitted successfully!", {
        id: "submit-progress",
        description: "Your CRM setup is now under review.",
        duration: 3000,
      });
      // Navigate to dashboard after approval
      window.setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    }, 2000);
  };

  return (
    <div id="page-wrapper">
      <SetupHeader title="CRM Setup Configurator" onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
      {currentStep !== 6 ? <SetupSidebar currentStep={currentStep} className="hidden md:block" /> : <div id="side-nav" />}
      {isMobileMenuOpen && isMobileView && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/10" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div ref={drawerRef} className="fixed top-0 left-0 h-full w-80 border-r dark:border-gray-700 dark:bg-gray-900 transform transition-transform duration-300 ease-in-out translate-x-0" style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}>
            <SetupSidebar currentStep={currentStep} isMobile />
          </div>
        </div>
      )}
      <BottomNav
        onSave={handleSave}
        onBack={handleBack}
        isLoading={isLoading}
        disabled={isLoading}
        buttonText={isLoading ? (currentStep === 6 ? 'Submitting...' : 'Saving...') : (currentStep === 6 ? 'Submit for Approval' : 'Save & Continue')}
        backText={getBackButtonText()}
        showBack={currentStep > 1}
      />
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
