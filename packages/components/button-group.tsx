import clsx from "clsx";
import React, { type HTMLAttributes } from "react";

export const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function ButtonGroup({ children, className }, ref) {
  return (
    <div
      ref={ref}
      className={clsx("inline-flex rounded-md", className)}
      role="group"
    >
      {React.Children.toArray(children)
        .filter((child) => React.isValidElement(child))
        .map((child, index, list) => {
          return React.cloneElement(
            child as React.ReactElement<HTMLAttributes<HTMLButtonElement>>,
            {
              className: clsx(
                "border border-b border-t border-gray-200 bg-transparent px-4 py-2 text-sm font-medium focus:z-10 focus:bg-[--brand-color] focus:text-white focus:ring-2 focus:ring-[--brand-color] data-[active]:bg-[--brand-color] data-[active]:text-white",
                !child!.props.disabled &&
                  "text-[--brand-color] hover:bg-[--brand-color] hover:text-white",
                child!.props.disabled && "text-gray-400",
                index === 0 && "rounded-s-lg",
                index !== 0 && "border-l-0",
                index === React.Children.count(list) - 1 && "rounded-e-lg",
              ),
            },
          );
        })}
    </div>
  );
});
