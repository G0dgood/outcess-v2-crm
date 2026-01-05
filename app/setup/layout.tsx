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

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { currentStep, isLoading, setIsLoading, onStepComplete, onStepBack, setupData, updateSetupData, isFetchingLineOfBusiness } = useSetup();
  const { user } = useUserInfo();
  const { setSelectedLineOfBusinessId } = useLineOfBusiness();
  const [createLineOfBusiness] = useCreateLineOfBusinessMutation();
  const [updateLineOfBusiness] = useUpdateLineOfBusinessMutation();

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

  const handleSave = async () => {
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
              },
            }).unwrap();

            toast.success("Step completed successfully!", {
              description: "Line of Business updated. Moving to the next step...",
              duration: 2000,
            });
          } catch (err: unknown) {
            const updateError = err as { status?: number; data?: { message?: string }; message?: string };
            // Check for various forms of "Not Found" error
            const isNotFoundError =
              updateError?.status === 404 ||
              updateError?.data?.message ||
              updateError?.message;

            // If update fails because it's not found, fall back to create
            if (isNotFoundError) {
              console.warn("Line of Business not found (caught via error check), creating new one...");

              // Create new Line of Business
              let targetCompanyId = user?.company?.id || setupData.companyId;
              const response = await createLineOfBusiness({
                name: setupData.lineOfBusinessName,
                timeZone: setupData.timeZone,
                industry: setupData.industry,
                businessSize: setupData.businessSize,
                userId: user?.id,
                companyName: setupData.companyName,
                companyId: targetCompanyId,
                lineOfBusinessName: setupData.lineOfBusinessName,
              }).unwrap();

              if (response.lineOfBusiness?._id) {
                setSelectedLineOfBusinessId(response.lineOfBusiness._id);
                updateSetupData({
                  lineOfBusinessId: response.lineOfBusiness._id,
                  companyName: response.lineOfBusiness.companyName || setupData.companyName,
                  companyId: response.lineOfBusiness.companyId || setupData.companyId,
                  lineOfBusinessName: response.lineOfBusiness.lineOfBusinessName || response.lineOfBusiness.name || setupData.lineOfBusinessName,
                  timeZone: response.lineOfBusiness.timeZone || setupData.timeZone,
                  industry: response.lineOfBusiness.industry || setupData.industry,
                  businessSize: response.lineOfBusiness.businessSize || setupData.businessSize,
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
          }).unwrap();



          if (response.lineOfBusiness?._id) {
            setSelectedLineOfBusinessId(response.lineOfBusiness._id);
            updateSetupData({
              lineOfBusinessId: response.lineOfBusiness._id,
              companyName: response.lineOfBusiness.companyName || setupData.companyName,
              companyId: response.lineOfBusiness.companyId || setupData.companyId,
              lineOfBusinessName: response.lineOfBusiness.lineOfBusinessName || response.lineOfBusiness.name || setupData.lineOfBusinessName,
              timeZone: response.lineOfBusiness.timeZone || setupData.timeZone,
              industry: response.lineOfBusiness.industry || setupData.industry,
              businessSize: response.lineOfBusiness.businessSize || setupData.businessSize,
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

        let updateData: any = {};
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

            updateData = formData;
            break;
          case 3:
            updateData = {
              dashboardSettings: setupData.dashboardSettings,
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
            };
            break;
          case 5:
            updateData = {
              userManagementSettings: setupData.userManagementSettings,
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

      onStepComplete();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string; error?: string } | string; message?: string };
      console.error("Failed to save changes:", error);

      // Extract error message from various possible locations in the error object
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (typeof error?.data === 'object' && error.data && 'message' in error.data && typeof error.data.message === 'string') {
        errorMessage = error.data.message;
      } else if (typeof error?.data === 'object' && error.data && 'error' in error.data && typeof error.data.error === 'string') {
        errorMessage = error.data.error;
      } else if (typeof error?.data === 'string') {
        errorMessage = error.data;
      } else if (error?.message) {
        errorMessage = error.message;
      }

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
    toast.loading("Submitting for approval...", {
      id: "submit-progress",
    });

    try {
      // Update the final step data
      await updateLineOfBusiness({
        id: setupData.lineOfBusinessId,
        data: {
          roleManagementSettings: setupData.roleManagementSettings,
          permissionAccessSettings: setupData.permissionAccessSettings,
          status: 'pending_approval', // Assuming there's a status field
        },
      }).unwrap();

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
    } catch (err: unknown) {
      const error = err as { data?: { message?: string; error?: string } | string; message?: string };
      console.error("Failed to submit:", error);
      setIsLoading(false);

      // Extract error message from various possible locations in the error object
      let errorMessage = "Could not submit configuration. Please try again.";

      if (typeof error?.data === 'object' && error.data && 'message' in error.data && typeof error.data.message === 'string') {
        errorMessage = error.data.message;
      } else if (typeof error?.data === 'object' && error.data && 'error' in error.data && typeof error.data.error === 'string') {
        errorMessage = error.data.error;
      } else if (typeof error?.data === 'string') {
        errorMessage = error.data;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error("Submission Failed", {
        id: "submit-progress",
        description: errorMessage,
      });
    }
  };

  const headerUser = user ? {
    name: user.name || `${(user['firstName'] as string) || ''} ${(user['lastName'] as string) || ''}`.trim() || (user['username'] as string) || 'User',
    role: (() => {
      type RoleLike = string | { roleName?: string };
      const roleValue = user.role as RoleLike | undefined;
      return typeof roleValue === 'string' ? roleValue : roleValue?.roleName || 'Administrator';
    })(),
    avatar: user.avatar,
    initials: (user.name || `${(user['firstName'] as string) || ''} ${(user['lastName'] as string) || ''}`.trim() || (user['username'] as string) || 'U')
      .split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
  } : undefined;

  return (
    <div id="page-wrapper">
      <SetupHeader
        title="CRM Setup Configurator"
        user={headerUser}
        onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
      />
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
        isLoading={mounted && (isLoading || isFetchingLineOfBusiness)}
        disabled={mounted && (isLoading || isFetchingLineOfBusiness)}
        buttonText={
          (mounted && isLoading) ? (currentStep === 6 ? 'Submitting...' : 'Saving...') :
            (mounted && isFetchingLineOfBusiness) ? 'Checking...' :
              (currentStep === 6 ? 'Submit for Approval' : 'Save & Continue')
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
