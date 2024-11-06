import { HiChevronRight } from "react-icons/hi";

import { cn } from "./lib/utils";
import { Link } from "./link";

export type BreadcrumbProps = React.ComponentPropsWithoutRef<"nav">;
export const Breadcrumb = ({
  className,
  children,
  ...props
}: BreadcrumbProps) => (
  <nav aria-label="breadcrumb" className={className} {...props}>
    <ol className="flex list-none flex-wrap">{children}</ol>
  </nav>
);

export type BreadcrumbItemProps = {
  href?: string;
} & React.ComponentPropsWithoutRef<"li">;
export const BreadcrumbItem = ({
  className,
  href,
  children,
  ...props
}: BreadcrumbItemProps) => {
  const isLink = typeof href !== "undefined";
  const Component = isLink ? Link : "span";

  return (
    <li
      className={cn("group inline-flex items-center text-sm font-medium")}
      {...props}
    >
      <HiChevronRight
        aria-hidden
        className="size-4 text-gray-400 group-first:hidden md:mx-2.5"
      />
      <Component
        // @ts-expect-error Link
        href={href}
        className={cn(
          "[&>[data-slot=icon]]:mr-2",
          isLink ? "text-fg-foreground hover:text-gray-900" : "text-gray-500",
          className,
        )}
      >
        {children}
      </Component>
    </li>
  );
};
