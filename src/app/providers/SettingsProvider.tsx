import React, { createContext, useContext, useEffect, useState } from "react";
import { getPublicAppSettings } from "@/src/app/actions";
import Spinner from "@magi/components/Spinner";
import { useParams } from "next/navigation";

type SettingsContextType = ClientSafeAppSettings | null;

const SettingsContext = createContext<SettingsContextType>(null);

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [settings, setSettings] = useState<SettingsContextType>(null);
  const {
    organizationId,
    agentId,
  }: { organizationId: string; agentId: string } = useParams();

  useEffect(() => {
    const loadSettings = async () => {
      if (organizationId && agentId) {
        const appSettings = await getPublicAppSettings(organizationId, agentId);
        setSettings(appSettings);
      } else {
        setSettings(null);
      }
    };

    void loadSettings();
  }, [organizationId, agentId]);

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
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
