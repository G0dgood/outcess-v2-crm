'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { ProgressProvider } from '@bprogress/next/dist/app';
import { ReduxProvider } from '@/components/providers/ReduxProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserInfoProvider } from '@/contexts/UserInfoContext';
import { PrivilegeProvider } from '@/contexts/PrivilegeContext';
import { CampaignProvider } from '@/contexts/CampaignContext';
import { SetupProvider } from '@/contexts/SetupContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { NavigationProvider } from '@/components/providers/NavigationProvider';
import { RealTimeUpdates } from '@/components/providers/RealTimeUpdates';
import { ThemeColorApplier } from '@/components/providers/ThemeColorApplier';

interface NewProviderProps {
  children: React.ReactNode;
}

const NewProvider: React.FC<NewProviderProps> = ({ children }) => {
  return (
    <ReduxProvider>
      <ProgressProvider
        height="4px"
        color="#6C8B7D"
        options={{ showSpinner: false }}
        shallowRouting>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider config={{ autoConnect: true }}>
              <UserInfoProvider>
                <CampaignProvider>
                  <SetupProvider>
                    <PrivilegeProvider>
                      <NavigationProvider>
                        <RealTimeUpdates />
                        <ThemeColorApplier />
                        {children}
                        <Toaster
                          position="top-right"
                          richColors
                          closeButton
                          toastOptions={{
                            style: { borderRadius: 0 },
                          }}
                        />
                      </NavigationProvider>
                    </PrivilegeProvider>
                  </SetupProvider>
                </CampaignProvider>
              </UserInfoProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </ProgressProvider>
    </ReduxProvider>
  );
};

export default NewProvider;

