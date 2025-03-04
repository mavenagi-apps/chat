import React, {
  createContext,
  useContext,
  type PropsWithChildren,
} from "react";

type CustomDataContextType = {
  customData: Record<string, any> | null;
} | null;

const CustomDataContext = createContext<CustomDataContextType>(null);

export const CustomDataProvider = ({
  customData,
  children,
}: PropsWithChildren<{
  customData: Record<string, any> | null;
}>) => {
  const value = {
    customData,
  };

  return (
    <CustomDataContext.Provider value={value}>
      {children}
    </CustomDataContext.Provider>
  );
};

export function useCustomData() {
  const context = useContext(CustomDataContext);
  if (context === null) {
    throw new Error("useCustomData must be used within an CustomDataProvider");
  }
  return context;
}
