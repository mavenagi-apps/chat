"use client";

import { Button } from "@/src/packages/ui/src/button";
import { cn } from "@/src/packages/ui/src/lib/utils";
import { LuCopy, LuCheck } from "react-icons/lu";
import { Logo } from "./Logo";
import { useCallback, useEffect, useState } from "react";
interface PreviewHeaderProps {
  badgeText?: string;
  showLogo?: boolean;
}

export function PreviewHeader({
  badgeText = "Preview",
  showLogo = true,
}: PreviewHeaderProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setIsCopied(true);

      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  }, [currentUrl]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="h-12 mx-auto max-w-[1344px]">
        <div className="h-full px-3 py-1.5 bg-[#f7f5f2] rounded-lg border border-[#efece8] backdrop-blur-[10px] flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-4 pl-1.5">
            {showLogo && (
              <div data-svg-wrapper className="relative">
                <Logo />
              </div>
            )}
            <div className="px-3 py-[9px] bg-[#f5ebe2] rounded-[18px] flex items-center">
              <div className="text-[#9b8c7c] text-xs font-bold font-['Control Upright'] leading-[10.80px]">
                {badgeText}
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            size="base"
            outline={true}
            onClick={handleCopyLink}
            className={cn(
              "px-6 py-1 bg-white rounded-xl border  border-[#dadee3] flex items-center gap-2",
              isCopied && "bg-green-50",
            )}
          >
            <div className="py-[1.50px] flex items-center gap-2">
              <span className="text-[#272c34] text-sm font-normal font-['Control Upright'] leading-[21px]">
                {isCopied ? "Copied!" : "Copy link"}
              </span>
            </div>
            {isCopied ? (
              <LuCheck className="h-4 w-4 text-green-600" />
            ) : (
              <LuCopy title="Copy link" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
