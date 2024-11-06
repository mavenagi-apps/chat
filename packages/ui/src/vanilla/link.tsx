import { DataInteractive as HeadlessDataInteractive } from "@headlessui/react";
import React from "react";

export const Link = React.forwardRef(function Link(
  props: { href: string } & React.ComponentPropsWithoutRef<"a">,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  return (
    <HeadlessDataInteractive>
      <a {...props} ref={ref} />
    </HeadlessDataInteractive>
  );
});
