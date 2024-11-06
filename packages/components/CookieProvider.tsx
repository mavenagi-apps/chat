import React, { createContext, useContext } from "react";

const CookieContext = createContext<string | undefined>(undefined);

export const CookieProvider = ({
  cookie,
  children,
}: {
  cookie?: string;
  children: React.ReactNode;
}) => {
  return (
    <CookieContext.Provider value={cookie}>{children}</CookieContext.Provider>
  );
};

export function useCookie() {
  return useContext(CookieContext);
}
