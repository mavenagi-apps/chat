import { DataInteractive as HeadlessDataInteractive } from "@headlessui/react";
import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import React from "react";

type LinkProps = NextLinkProps & React.ComponentPropsWithoutRef<"a">;
export const Link = React.forwardRef(function Link(
  props: LinkProps,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  return (
    <HeadlessDataInteractive>
      <NextLink prefetch={false} {...props} ref={ref} />
    </HeadlessDataInteractive>
  );
});
