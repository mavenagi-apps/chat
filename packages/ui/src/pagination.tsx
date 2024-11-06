import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import React from "react";

import { Button } from "./button";
import { cn } from "./lib/utils";

export function Pagination({
  "aria-label": ariaLabel = "Page navigation",
  className,
  ...props
}: React.ComponentPropsWithoutRef<"nav">) {
  return (
    <nav
      aria-label={ariaLabel}
      {...props}
      className={cn(
        "flex items-stretch divide-x divide-zinc-950/10",
        className,
      )}
    />
  );
}

export function PaginationPrevious({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  return (
    <span className="grow basis-0">
      <Button
        variant="secondary"
        aria-label="Previous page"
        className={cn(
          "rounded-r-none border-r-0 before:rounded-r-none after:rounded-r-none",
          className,
        )}
        {...props}
      >
        <ChevronLeftIcon />
        {children}
      </Button>
    </span>
  );
}

export function PaginationNext({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  return (
    <span className="flex grow basis-0 justify-end">
      <Button
        variant="secondary"
        aria-label="Next page"
        className={cn(
          "rounded-l-none border-l-0 before:rounded-l-none after:rounded-l-none",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronRightIcon />
      </Button>
    </span>
  );
}

export function PaginationList({ children }: { children: React.ReactNode }) {
  return <span className="hidden items-baseline sm:flex">{children}</span>;
}
