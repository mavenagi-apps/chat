import React, { createContext, useContext, useEffect, useState } from 'react';
import { getPublicAppSettings } from '@/app/actions';
import Spinner from '@magi/components/Spinner';
import { useParams } from 'next/navigation';


type SettingsContextType = Partial<AppSettings> | null;

const SettingsContext = createContext<SettingsContextType>(null);

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [settings, setSettings] = useState<SettingsContextType>(null);
  const { orgFriendlyId, id: agentId }: { orgFriendlyId: string, id: string } = useParams();

  useEffect(() => {
    console.log('Loading settings');
    const loadSettings = async () => {
      const appSettings = await getPublicAppSettings(orgFriendlyId, agentId);
      setSettings(appSettings);
      console.log('Settings loaded', appSettings);
    };

    void loadSettings();
  }, [orgFriendlyId, agentId]);

  if (!settings) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === null) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 