import React from "react";

import { cn } from "../lib/utils";
import { Link } from "../link";

export type DesktopNavbarProps = React.HTMLAttributes<HTMLDivElement>;
export const DesktopNavbar = ({ className, ...props }: DesktopNavbarProps) => (
  <div
    className={cn(
      "z-10 flex h-16 flex-1 items-center gap-2 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 [&>*:first-child]:mr-auto",
      className,
    )}
    {...props}
  />
);

export type DesktopNavbarBrandProps = React.PropsWithChildren<{
  href?: string;
  className?: string;
}>;
export const DesktopNavbarBrand = ({
  className,
  href,
  ...props
}: DesktopNavbarBrandProps) => {
  const Element = href ? Link : "div";
  return (
    <Element
      // @ts-expect-error Link
      href={href}
      className={cn(
        "text-fg-primary flex h-full flex-shrink-0 items-center px-4 text-sm font-semibold",
        className,
      )}
      {...props}
    />
  );
};
