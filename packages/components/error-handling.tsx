"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { ErrorFallbackRender } from "@magi/ui/src/error-boundary";

export const ErrorBoundary = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const MavenFallbackRender = (errorData: {
    error: unknown;
    componentStack: string;
    eventId: string;
    resetError(): void;
  }) => {
    return (
      <ErrorFallbackRender
        error={errorData.error as Error}
        resetErrorBoundary={errorData.resetError}
        componentStack={errorData.componentStack}
        eventId={errorData.eventId}
        className={className}
      />
    );
  };
  return (
    <Sentry.ErrorBoundary fallback={MavenFallbackRender}>
      {children}
    </Sentry.ErrorBoundary>
  );
};

export const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <ErrorFallbackRender
      error={error}
      resetErrorBoundary={reset}
      eventId={error.digest}
      componentStack={error.stack}
    />
  );
};
