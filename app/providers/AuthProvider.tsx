import React, {
  createContext,
  useContext,
  type PropsWithChildren,
  useMemo,
} from "react";

type AuthContextType = {
  signedUserData: string | null;
  unsignedUserData: Record<string, any> | null;
  isAuthenticated: boolean;
} | null;

const AuthContext = createContext<AuthContextType>(null);

export const AuthProvider = ({
  signedUserData,
  unsignedUserData,
  children,
}: PropsWithChildren<{
  signedUserData: string | null;
  unsignedUserData: Record<string, any> | null;
}>) => {
  const isAuthenticated = useMemo(() => !!signedUserData, [signedUserData]);
  const value = {
    signedUserData,
    unsignedUserData,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
