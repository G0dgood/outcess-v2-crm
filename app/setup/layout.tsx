"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/ui/BottomNav";
import SetupHeader from "@/components/ui/SetupHeader";
import SetupSidebar from "@/components/ui/SetupSidebar";
import UnsavedChangesModal from "@/components/ui/UnsavedChangesModal";
import { SetupProvider, useSetup } from "@/contexts/SetupContext";
import { toast } from "sonner";
import { useUserInfo } from "@/contexts/UserInfoContext";
import { useCampaign } from "@/contexts/CampaignContext";
import { useCreateCampaignMutation, useUpdateCampaignMutation, useUpdateBucketCustomerFieldsMutation } from "@/store/services/campaignApi";
import { ApiError, extractErrorMessage } from "@/utils/apiError";

type CampaignLike = {
  _id?: string;
  companyName?: string;
  companyId?: string;
  campaignName?: string;
  name?: string;
  timeZone?: string;
  industry?: string;
  businessSize?: string;
};

type RoleValue = string | { roleName?: string };

const getProgressForStep = (step: number): number => {
  switch (step) {
    case 1:
      return 25;
    case 2:
      return 50;
    case 3:
      return 75;
    case 4:
      return 100;
    default:
      return 0;
  }
};

function LayoutContent({ children }: { children: React.ReactNode }) {
  const {
    currentStep,
    isLoading,
    setIsLoading,
    onStepComplete,
    onStepBack,
    setupData,
    updateSetupData,
    updateDashboardSettings,
    isFetchingCampaign,
    dashboardStep,
    setDashboardStep,
    validateStep,
    registerPersist,
    resetDirty,
    discardChanges,
    isDirty,
    onPersist
  } = useSetup();
  const { user } = useUserInfo();
  const { setSelectedCampaignId } = useCampaign();
  const [createCampaign] = useCreateCampaignMutation();
  const [updateCampaign] = useUpdateCampaignMutation();
  const [updateBucketCustomerFields] = useUpdateBucketCustomerFieldsMutation();

  const rawRole = (user as { role?: RoleValue } | null | undefined)?.role;
  const creatorRoleName =
    typeof rawRole === "string" ? rawRole : rawRole?.roleName;
  const isSupervisorCreator = creatorRoleName === "Supervisor";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [modalAction, setModalAction] = useState<'exit' | 'back' | null>(null);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobileView(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);




  const performBackNavigation = useCallback(() => {
    if (currentStep === 2 && setupData.dashboardSettings.activeTab === 'disposition') {
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
  }, [currentStep, setupData.dashboardSettings.activeTab, setDashboardStep, updateDashboardSettings, onStepBack]);

  const handleBackStep = useCallback(() => {
    if (isDirty) {
      setModalAction('back');
      setShowUnsavedModal(true);
    } else {
      performBackNavigation();
    }
  }, [isDirty, performBackNavigation]);

  const handleExitToDashboard = useCallback(() => {
    if (isDirty) {
      setModalAction('exit');
      setShowUnsavedModal(true);
    } else {
      router.push('/dashboard');
    }
  }, [isDirty, router]);

  const handleBackWithoutSaving = useCallback(() => {
    discardChanges();
    setShowUnsavedModal(false);
    if (modalAction === 'exit') {
      router.push('/dashboard');
    } else {
      performBackNavigation();
    }
  }, [discardChanges, modalAction, router, performBackNavigation]);

  const handleSaveAndExit = useCallback(async () => {
    if (onPersist) {
      await onPersist(false);
      resetDirty();
    }
    setShowUnsavedModal(false);
    if (modalAction === 'exit') {
      router.push('/dashboard');
    } else {
      performBackNavigation();
    }
  }, [onPersist, resetDirty, modalAction, router, performBackNavigation]);

  const getBackButtonText = () => {
    switch (currentStep) {
      case 2: return "Back to Basic Setup";
      case 3: return "Back to Dashboard";
      case 4: return "Back to Customer Book";
      default: return "Back";
    }
  };

  const handleSubmitForApproval = useCallback(async () => {
    if (!setupData.campaignId) {
      toast.error("Error", {
        description: "Campaign ID is missing. Please restart the setup.",
      });
      return;
    }

    setIsLoading(true);

    const status = isSupervisorCreator ? "In Review" : "Approved";
    const loadingMessage = isSupervisorCreator ? "Submitting for approval..." : "Approving LOB plan...";
    const successTitle = isSupervisorCreator ? "Campaign submitted successfully!" : "Campaign approved successfully!";
    const successDescription = isSupervisorCreator
      ? "Your CRM setup is now under review."
      : "Your CRM setup has been approved.";

    toast.loading(loadingMessage, {
      id: "submit-progress",
    });

    try {
      await updateCampaign({
        id: setupData.campaignId,
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
  }, [setupData.campaignId, isSupervisorCreator, updateCampaign, setIsLoading]);

  const handlePersist = useCallback(async (shouldAdvance: boolean = false) => {
    if (currentStep === 4) {
      handleSubmitForApproval();
      return;
    }

    if (shouldAdvance && !validateStep(currentStep)) {
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
        // Construct basic data object
        const baseData = {
          name: setupData?.campaignName || '',
          timeZone: setupData?.timeZone || '',
          industry: setupData?.industry || '',
          businessSize: setupData?.businessSize || '',
          companyId: user?.company?.id || setupData?.companyId || '',
          campaignName: setupData?.campaignName || '',
          progress,
        };

        // Prepare final data (FormData if file exists, otherwise plain object)
        let finalData: any = { ...baseData, logo: setupData.logo || '' };
        
        if (setupData.logoFile) {
          const formData = new FormData();
          Object.entries(baseData).forEach(([key, value]) => {
            formData.append(key, String(value));
          });
          formData.append('logo', setupData.logoFile);
          finalData = formData;
        }

        if (setupData.campaignId) {
          try {
            // If we already have an ID, update instead of create
            await updateCampaign({
              id: setupData.campaignId,
              data: finalData,
            }).unwrap();

            if (!shouldAdvance) {
              toast.success("Progress saved!", {
                description: "Your changes have been persisted.",
                duration: 2000,
              });
              resetDirty();
            }
          } catch (err: unknown) {
            const updateError = err as ApiError;
            // Check for various forms of "Not Found" error
            const isNotFoundError =
              updateError?.status === 404 ||
              !!extractErrorMessage(updateError, "");

            // If update fails because it's not found, fall back to create
            if (isNotFoundError) {
              console.warn("Campaign not found (caught via error check), creating new one...");

              // Create new Campaign
              const targetCompanyId = user?.company?.id || setupData.companyId;
              
              // Prepare for create
              let createData: any = { ...baseData, userId: user?.id, companyName: setupData.companyName, companyId: targetCompanyId, logo: setupData.logo || '' };
              if (setupData.logoFile) {
                const formData = new FormData();
                Object.entries(createData).forEach(([key, value]) => {
                  if (key !== 'logo') formData.append(key, String(value));
                });
                formData.append('logo', setupData.logoFile);
                createData = formData;
              }

              const response = await createCampaign(createData).unwrap();

              const createdCampaign = (response as { campaign?: CampaignLike }).campaign;

              if (createdCampaign?._id) {
                setSelectedCampaignId(createdCampaign._id);
                updateSetupData({
                  campaignId: createdCampaign._id,
                  companyName: createdCampaign.companyName || setupData.companyName,
                  companyId: createdCampaign.companyId || setupData.companyId,
                  campaignName: createdCampaign.campaignName || createdCampaign.name || setupData.campaignName,
                  timeZone: createdCampaign.timeZone || setupData.timeZone,
                  industry: createdCampaign.industry || setupData.industry,
                  businessSize: createdCampaign.businessSize || setupData.businessSize,
                });
              }

              if (!shouldAdvance) {
                toast.success("Progress saved!", {
                  description: "New Campaign created and saved.",
                  duration: 2000,
                });
                resetDirty();
              }
            } else {
              throw updateError;
            }
          }
        } else {
          // Create new Campaign
          const targetCompanyId = user?.company?.id || setupData.companyId;
          
          let createData: any = { ...baseData, userId: user?.id, companyName: setupData.companyName, companyId: targetCompanyId, logo: setupData.logo || '' };
          if (setupData.logoFile) {
            const formData = new FormData();
            Object.entries(createData).forEach(([key, value]) => {
              if (key !== 'logo') formData.append(key, String(value));
            });
            formData.append('logo', setupData.logoFile);
            createData = formData;
          }

          const response = await createCampaign(createData).unwrap();

          const createdCampaign = (response as { campaign?: CampaignLike }).campaign;

          if (createdCampaign?._id) {
            setSelectedCampaignId(createdCampaign._id);
            updateSetupData({
              campaignId: createdCampaign._id,
              companyName: createdCampaign.companyName || setupData.companyName,
              companyId: createdCampaign.companyId || setupData.companyId,
              campaignName: createdCampaign.campaignName || createdCampaign.name || setupData.campaignName,
              timeZone: createdCampaign.timeZone || setupData.timeZone,
              industry: createdCampaign.industry || setupData.industry,
              businessSize: createdCampaign.businessSize || setupData.businessSize,
            });
          }

          if (!shouldAdvance) {
            toast.success("Progress saved!", {
              description: "Campaign created.",
              duration: 2000,
            });
            resetDirty();
          }
        }
      } else {
        if (!setupData.campaignId) {
          throw new Error("Campaign ID is missing. Please restart the setup.");
        }

        let updateData: FormData | Record<string, unknown> = {};
        switch (currentStep) {
          case 2:
            updateData = {
              dashboardSettings: setupData.dashboardSettings,
              progress,
            };
            break;
          case 3:
            // Sync all bucket-specific customer fields individually
            const buckets = setupData.dashboardSettings.buckets || [];
            if (buckets.length > 0) {
              await Promise.all(
                buckets.map((bucket) =>
                  updateBucketCustomerFields({
                    id: setupData.campaignId!,
                    bucketId: bucket.id,
                    customerFields: bucket.customerFields || [],
                  }).unwrap()
                )
              );
            }

            updateData = {
              customerBookSettings: setupData.customerBookSettings,
              progress,
            };
            break;
        }

        await updateCampaign({
          id: setupData.campaignId,
          data: updateData,
        }).unwrap();

        if (!shouldAdvance) {
          toast.success("Progress saved!", {
            description: "Step data persisted successfully.",
            duration: 2000,
          });
          resetDirty();
        }
      }

      if (shouldAdvance) {
        toast.success("Step completed successfully!", {
          description: "Moving to the next step...",
          duration: 2000,
        });
        resetDirty();
        if (currentStep === 2) {
          onStepComplete();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          onStepComplete();
        }
      }
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error("Failed to persist changes:", error);

      const errorMessage = extractErrorMessage(error, "An unexpected error occurred. Please try again.");

      toast.error("Failed to save changes", {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, handleSubmitForApproval, validateStep, setIsLoading, setupData, updateCampaign, user, createCampaign, setSelectedCampaignId, updateSetupData, resetDirty, onStepComplete]);

  const handleSave = () => handlePersist(true);

  useEffect(() => {
    registerPersist(handlePersist);
    return () => registerPersist(null);
  }, [currentStep, setupData, user, registerPersist, validateStep, handlePersist]);




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
        onBack={handleExitToDashboard}
      />
      {currentStep !== 4 ? <SetupSidebar currentStep={currentStep} className="hidden md:block" /> : <div id="side-nav" />}
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
        onBack={handleBackStep}
        isLoading={mounted && (isLoading || isFetchingCampaign)}
        disabled={mounted && (isLoading || isFetchingCampaign)}
        buttonText={
          (mounted && isLoading)
            ? (currentStep === 4
              ? (isSupervisorCreator ? 'Submitting...' : 'Approving...')
              : 'Saving...')
            : (mounted && isFetchingCampaign)
              ? 'Checking...'
              : (currentStep === 4
                ? (isSupervisorCreator ? 'Send for Approval' : 'Approve')
                : 'Save & Continue')
        }
        backText={getBackButtonText()}
        showBack={currentStep > 1}
      />
      <main>{children}</main>
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onSaveAndExit={handleSaveAndExit}
        onBackWithoutSaving={handleBackWithoutSaving}
        isLoading={isLoading}
      />
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
