"use client";
import BottomNav from "@/components/ui/BottomNav";
import SetupHeader from "@/components/ui/SetupHeader";
import SetupSidebar from "@/components/ui/SetupSidebar";
import React, { useState, useEffect } from "react";
import { SetupProvider, useSetup } from "@/contexts/SetupContext";
import { toast } from "sonner";
import { useUserInfo } from "@/contexts/UserInfoContext";
import { useLineOfBusiness } from "@/contexts/LineOfBusinessContext";
import { useCreateLineOfBusinessMutation, useUpdateLineOfBusinessMutation } from "@/store/services/lineOfBusinessApi";
import { ApiError, extractErrorMessage } from "@/utils/apiError";

type LineOfBusinessLike = {
  _id?: string;
  companyName?: string;
  companyId?: string;
  lineOfBusinessName?: string;
  name?: string;
  timeZone?: string;
  industry?: string;
  businessSize?: string;
};

type RoleValue = string | { roleName?: string };

const getProgressForStep = (step: number): number => {
  switch (step) {
    case 1:
      return 20;
    case 2:
      return 40;
    case 3:
      return 60;
    case 4:
      return 80;
    default:
      return 0;
  }
};

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { currentStep, isLoading, setIsLoading, onStepComplete, onStepBack, setupData, updateSetupData, updateDashboardSettings, isFetchingLineOfBusiness, dashboardStep, setDashboardStep } = useSetup();
  const { user } = useUserInfo();
  const { setSelectedLineOfBusinessId } = useLineOfBusiness();
  const [createLineOfBusiness] = useCreateLineOfBusinessMutation();
  const [updateLineOfBusiness] = useUpdateLineOfBusinessMutation();

  const rawRole = (user as { role?: RoleValue } | null | undefined)?.role;
  const creatorRoleName =
    typeof rawRole === "string" ? rawRole : rawRole?.roleName;
  const isSupervisorCreator = creatorRoleName === "Supervisor";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const drawerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobileView(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);



  const validateCurrentStep = () => {
    if (currentStep === 1) {
      // Validate Basic Setup
      if (
        !setupData?.companyName.trim() ||
        !setupData?.timeZone ||
        !setupData?.industry ||
        !setupData?.businessSize
      ) {
        return false;
      }
    }
    // Add validation for other steps as needed
    return true;
  };

  const handleBack = () => {
    if (currentStep === 3 && setupData.dashboardSettings.activeTab === 'disposition') {
      setDashboardStep('KPI Metric');
      updateDashboardSettings({ activeTab: 'kpi' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep > 1) {
      onStepBack();
      setDashboardStep('KPI Metric');
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
      default: return "Back";
    }
  };

  const handleSave = async () => {
    if (currentStep === 5) {
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

    const progress = getProgressForStep(currentStep);

    try {
      if (currentStep === 1) {
        if (setupData.lineOfBusinessId) {
          try {
            // If we already have an ID, update instead of create
            await updateLineOfBusiness({
              id: setupData.lineOfBusinessId,
              data: {
                name: setupData?.lineOfBusinessName || '',
                timeZone: setupData?.timeZone || '',
                industry: setupData?.industry || '',
                businessSize: setupData?.businessSize || '',
                companyName: setupData?.companyName || '',
                companyId: user?.company?.id || setupData?.companyId || '',
                lineOfBusinessName: setupData?.lineOfBusinessName || '',
                progress,
              },
            }).unwrap();

            toast.success("Step completed successfully!", {
              description: "Line of Business updated. Moving to the next step...",
              duration: 2000,
            });
          } catch (err: unknown) {
            const updateError = err as ApiError;
            // Check for various forms of "Not Found" error
            const isNotFoundError =
              updateError?.status === 404 ||
              !!extractErrorMessage(updateError, "");

            // If update fails because it's not found, fall back to create
            if (isNotFoundError) {
              console.warn("Line of Business not found (caught via error check), creating new one...");

              // Create new Line of Business
              const targetCompanyId = user?.company?.id || setupData.companyId;
              const response = await createLineOfBusiness({
                name: setupData.lineOfBusinessName,
                timeZone: setupData.timeZone,
                industry: setupData.industry,
                businessSize: setupData.businessSize,
                userId: user?.id,
                companyName: setupData.companyName,
                companyId: targetCompanyId,
                lineOfBusinessName: setupData.lineOfBusinessName,
                progress,
              }).unwrap();

              const createdLineOfBusiness = (response as { lineOfBusiness?: LineOfBusinessLike }).lineOfBusiness;

              if (createdLineOfBusiness?._id) {
                setSelectedLineOfBusinessId(createdLineOfBusiness._id);
                updateSetupData({
                  lineOfBusinessId: createdLineOfBusiness._id,
                  companyName: createdLineOfBusiness.companyName || setupData.companyName,
                  companyId: createdLineOfBusiness.companyId || setupData.companyId,
                  lineOfBusinessName: createdLineOfBusiness.lineOfBusinessName || createdLineOfBusiness.name || setupData.lineOfBusinessName,
                  timeZone: createdLineOfBusiness.timeZone || setupData.timeZone,
                  industry: createdLineOfBusiness.industry || setupData.industry,
                  businessSize: createdLineOfBusiness.businessSize || setupData.businessSize,
                });
              }

              toast.success("Step completed successfully!", {
                description: "Line of Business created. Moving to the next step...",
                duration: 2000,
              });
            } else {
              throw updateError;
            }
          }
        } else {
          // Create new Line of Business
          const targetCompanyId = user?.company?.id || setupData.companyId;
          const response = await createLineOfBusiness({
            name: setupData.lineOfBusinessName,
            timeZone: setupData.timeZone,
            industry: setupData.industry,
            businessSize: setupData.businessSize,
            userId: user?.id,
            companyName: setupData.companyName,
            companyId: targetCompanyId,
            lineOfBusinessName: setupData.lineOfBusinessName,
            progress,
          }).unwrap();

          const createdLineOfBusiness = (response as { lineOfBusiness?: LineOfBusinessLike }).lineOfBusiness;

          if (createdLineOfBusiness?._id) {
            setSelectedLineOfBusinessId(createdLineOfBusiness._id);
            updateSetupData({
              lineOfBusinessId: createdLineOfBusiness._id,
              companyName: createdLineOfBusiness.companyName || setupData.companyName,
              companyId: createdLineOfBusiness.companyId || setupData.companyId,
              lineOfBusinessName: createdLineOfBusiness.lineOfBusinessName || createdLineOfBusiness.name || setupData.lineOfBusinessName,
              timeZone: createdLineOfBusiness.timeZone || setupData.timeZone,
              industry: createdLineOfBusiness.industry || setupData.industry,
              businessSize: createdLineOfBusiness.businessSize || setupData.businessSize,
            });
          }

          toast.success("Step completed successfully!", {
            description: "Line of Business created. Moving to the next step...",
            duration: 2000,
          });
        }
      } else {
        if (!setupData.lineOfBusinessId) {
          throw new Error("Line of Business ID is missing. Please restart the setup.");
        }

        let updateData: FormData | Record<string, unknown> = {};
        switch (currentStep) {
          case 2:
            const formData = new FormData();
            if (setupData.logoFile) {
              formData.append('logo', setupData.logoFile);
            }
            formData.append('selectedLayout', setupData.selectedLayout);
            formData.append('primaryColor', setupData.primaryColor);
            formData.append('secondaryColor', setupData.secondaryColor);
            formData.append('navigationSettings', JSON.stringify(setupData.navigationSettings));
            formData.append('progress', String(progress));

            updateData = formData;
            break;
          case 3:
            updateData = {
              dashboardSettings: setupData.dashboardSettings,
              progress,
            };
            break;
          case 4:
            // Ensure configuredFields is a clean array before sending
            const cleanConfiguredFields = setupData.customerBookSettings.configuredFields.map(field => ({
              id: field.id,
              name: field.name,
              type: field.type,
              required: field.required
            }));

            updateData = {
              customerBookSettings: {
                ...setupData.customerBookSettings,
                configuredFields: cleanConfiguredFields
              },
              progress,
            };
            break;
        }

        await updateLineOfBusiness({
          id: setupData.lineOfBusinessId,
          data: updateData,
        }).unwrap();

        toast.success("Step completed successfully!", {
          description: "Changes saved. Moving to the next step...",
          duration: 2000,
        });
      }

      if (currentStep === 3) {
        onStepComplete();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        onStepComplete();
      }
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error("Failed to save changes:", error);

      const errorMessage = extractErrorMessage(error, "An unexpected error occurred. Please try again.");

      toast.error("Failed to save changes", {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!setupData.lineOfBusinessId) {
      toast.error("Error", {
        description: "Line of Business ID is missing. Please restart the setup.",
      });
      return;
    }

    setIsLoading(true);

    const status = isSupervisorCreator ? "In Review" : "Approved";
    const loadingMessage = isSupervisorCreator ? "Submitting for approval..." : "Approving LOB plan...";
    const successTitle = isSupervisorCreator ? "LOB Plan submitted successfully!" : "LOB Plan approved successfully!";
    const successDescription = isSupervisorCreator
      ? "Your CRM setup is now under review."
      : "Your CRM setup has been approved.";

    toast.loading(loadingMessage, {
      id: "submit-progress",
    });

    try {
      await updateLineOfBusiness({
        id: setupData.lineOfBusinessId,
        data: {
          status,
          progress: 100,
        },
      }).unwrap();

      setIsLoading(false);
      toast.success(successTitle, {
        id: "submit-progress",
        description: successDescription,
        duration: 3000,
      });

      // Navigate to dashboard after approval
      window.setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error("Failed to submit:", error);
      setIsLoading(false);

      const errorMessage = extractErrorMessage(error, "Could not submit LOB plan. Please try again.");

      toast.error("Submission Failed", {
        id: "submit-progress",
        description: errorMessage,
      });
    }
  };

  const headerUser = user
    ? (() => {
      const hasName = typeof user.name === "string" && user.name.trim().length > 0;
      const rawFirstName = user["firstName"];
      const rawLastName = user["lastName"];
      const rawUsername = user["username"];
      const firstName = typeof rawFirstName === "string" ? rawFirstName : "";
      const lastName = typeof rawLastName === "string" ? rawLastName : "";
      const username = typeof rawUsername === "string" ? rawUsername : "";
      const fallbackName = `${firstName} ${lastName}`.trim() || username || "User";
      const name = hasName ? user.name : fallbackName;

      const roleValue = user.role as RoleValue | undefined;
      const role = typeof roleValue === "string" ? roleValue : roleValue?.roleName || "Administrator";

      const initialsSource = name || "U";
      const initials = initialsSource
        .split(" ")
        .filter(Boolean)
        .map(part => part[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      return {
        name,
        role,
        avatar: user.avatar,
        initials,
      };
    })()
    : undefined;

  return (
    <div id="page-wrapper">
      <SetupHeader
        title="CRM Setup Configurator"
        user={headerUser}
        onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
      />
      {currentStep !== 5 ? <SetupSidebar currentStep={currentStep} className="hidden md:block" /> : <div id="side-nav" />}
      {isMobileMenuOpen && isMobileView && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/10" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div ref={drawerRef} className="fixed top-0 left-0 h-full w-80 border-r dark:border-gray-700 dark:bg-gray-900 transform transition-transform duration-300 ease-in-out translate-x-0" style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}>
            <SetupSidebar currentStep={currentStep} isMobile />
          </div>
        </div>
      )}
      <BottomNav
        dashboardStep={dashboardStep}
        setDashboardStep={setDashboardStep}
        currentStep={currentStep}
        onSave={handleSave}
        onBack={handleBack}
        isLoading={mounted && (isLoading || isFetchingLineOfBusiness)}
        disabled={mounted && (isLoading || isFetchingLineOfBusiness)}
        buttonText={
          (mounted && isLoading)
            ? (currentStep === 5
              ? (isSupervisorCreator ? 'Submitting...' : 'Approving...')
              : 'Saving...')
            : (mounted && isFetchingLineOfBusiness)
              ? 'Checking...'
              : (currentStep === 5
                ? (isSupervisorCreator ? 'Send for Approval' : 'Approve')
                : 'Save & Continue')
        }
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
