"use client";

import {
  Button as HeadlessButton,
  type ButtonProps as HeadlessButtonProps,
} from "@headlessui/react";
import React from "react";

import { useButtonGroupContext } from "./button-group";
import { cn } from "./lib/utils";
import { Link } from "./link";
import { Spinner } from "./spinner";
import { TouchTarget, buttonStyles } from "./vanilla/button";

type ButtonProps = (
  | { outline?: never; plain?: never; link?: never }
  | { outline: true; plain?: never; link?: never }
  | { outline?: never; plain: true; link?: never }
  | { outline?: never; plain?: never; link: true }
) & {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "danger"
    | "warning"
    | "success";
  size?: "base" | "lg";
  isProcessing?: boolean;
} & (HeadlessButtonProps | React.ComponentPropsWithoutRef<typeof Link>);
export const Button = React.forwardRef(function Button(
  {
    variant = "primary",
    outline,
    plain,
    link,
    isProcessing = false,
    className,
    children,
    ...props
  }: ButtonProps,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const buttonGroupContext = useButtonGroupContext();

  const classes = cn(
    buttonGroupContext === undefined
      ? [
          // Base
          "relative isolate inline-flex items-center justify-center gap-x-2",
          // Focus
          "focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-violet-700",
          // Disabled
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          link
            ? [
                // Base
                "rounded-sm text-xs/[18px] font-normal text-gray-900 underline",
                // Focus
                "hover:text-violet-700 data-[focus]:outline-offset-[6px]",
                // Icon
                "[&>[data-slot=icon]]:size-4 [&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:text-violet-700",
                isProcessing && "pointer-events-none",
              ]
            : [
                buttonStyles.base,
                outline
                  ? cn(
                      buttonStyles.outline,
                      buttonStyles.colors.outline[variant],
                    )
                  : plain
                    ? cn(buttonStyles.plain, buttonStyles.colors.plain[variant])
                    : cn(
                        buttonStyles.solid,
                        buttonStyles.colors.solid[variant],
                      ),
              ],
        ]
      : [
          "shrink-0 border-y border-l px-3 py-1 text-sm/6 font-medium text-gray-500 first:rounded-l-md first:border-l last:rounded-r-md last:border-r",
          "data-[active]:bg-violet-700 data-[hover]:bg-violet-600 data-[active]:text-white data-[hover]:text-white",
        ],
    className,
  );

  return "href" in props ? (
    <Link
      {...props}
      className={cn(classes)}
      ref={ref as React.ForwardedRef<HTMLAnchorElement>}
    >
      {isProcessing && <Spinner />}
      <TouchTarget>{children}</TouchTarget>
    </Link>
  ) : (
    <HeadlessButton
      {...props}
      className={cn(classes, "cursor-pointer")}
      ref={ref}
    >
      {isProcessing && <Spinner />}
      <TouchTarget>{children}</TouchTarget>
    </HeadlessButton>
  );
});
