"use client";

import { FetcherProvider } from "@/lib/fetcher/react";
import { getAccessToken } from "@auth0/nextjs-auth0";
import {
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { useTranslations } from "next-intl";
// import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import NextAdapterApp from "next-query-params/app";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { QueryParamProvider } from "use-query-params";
import Spinner from "@/components/Spinner";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { CookieProvider } from "@/components/CookieProvider";
import { MagiProduct } from "@/lib/analytics/events";
import { rpc } from "@/rpc/react";
import { Fetcher } from "@magi/fetcher";

function InnerProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = rpc.users.me.profile.useQuery(undefined);

  return (
    <AnalyticsProvider
      product={MagiProduct.chat}
      userId={profile.data?.id}
      email={profile.data?.email}
    >
      <Suspense fallback={<Spinner />}>{children}</Suspense>
    </AnalyticsProvider>
  );
}

export default function Providers({
  cookie,
  children,
}: {
  cookie?: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("global");
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
          },
        },
      })
  );
  console.log(
    new URL(
      "/api/v1",
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_SPRINGBOOT_API_HOST ??
          "http://api-server:8080"
        : window.location.origin
    ).toString()
  );
  const fetcher = new Fetcher({
    baseUrl: new URL(
      "/api/v1",
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_SPRINGBOOT_API_HOST ??
          "http://api-server:8080"
        : window.location.origin
    ).toString(),
    config: async () => {
      let accessToken: string | undefined = undefined;
      if (typeof window === "undefined") {
        try {
          accessToken = (await getAccessToken()).accessToken;
        } catch (_) {
          /* ignore */
        }
      }
      return {
        headers: {
          ...(accessToken && {
            authorization: `Bearer ${accessToken}`,
          }),
          ...(cookie &&
            typeof window !== "undefined" && {
              cookie,
            }),
        },
      };
    },
  });

  return (
    <CookieProvider cookie={cookie}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryStreamedHydration>
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                onReset={reset}
                fallbackRender={({ resetErrorBoundary }) => (
                  <div>
                    {t("error")}
                    <button onClick={() => resetErrorBoundary()}>
                      {t("try_again")}
                    </button>
                  </div>
                )}
              >
                <QueryParamProvider adapter={NextAdapterApp}>
                  <FetcherProvider fetcher={fetcher}>
                    <InnerProviders>
                      {children}
                    </InnerProviders>
                  </FetcherProvider>
                </QueryParamProvider>
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </ReactQueryStreamedHydration>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </CookieProvider>
  );
}
