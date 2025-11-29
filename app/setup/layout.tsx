"use client";

import Dashboard from "@/components/setupIcon/Dashboard";
import Group from "@/components/setupIcon/Group";
import Mark from "@/components/setupIcon/Mark";
import Menu from "@/components/setupIcon/Menu";
import UserAlt from "@/components/setupIcon/UserAlt";
import BottomNav from "@/components/ui/BottomNav";
import SetupHeader from "@/components/ui/SetupHeader";
import SetupSidebar from "@/components/ui/SetupSidebar";
import React, { useRef } from "react";
import { SetupProvider, useSetup } from "@/contexts/SetupContext";
import { toast } from "sonner";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { currentStep, isLoading, setIsLoading, onStepComplete, onStepBack, setupData } = useSetup();
  const saveTimeoutRef = useRef<number | null>(null);
  const submitTimeoutRef = useRef<number | null>(null);

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
      console.log('Step completed:', currentStep);
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
      <SetupHeader title="CRM Setup Configurator" />
      {currentStep !== 6 ? <SetupSidebar currentStep={currentStep} /> : <div id="side-nav" />}
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
