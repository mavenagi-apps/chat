import imgMaven from "@/assets/logo/mavenagi_logo_wide_on_light.svg";
import imgMavenPurple from "@/assets/logo/mavenagi_logo_wide_on_light_purple.svg";

import Image from "next/image";
import * as React from "react";

export function Logo({
  className = "h-8",
  width = 110,
  height = 32,
  version = "black",
}: {
  className?: string;
  width?: number;
  height?: number;
  version?: "black" | "purple";
}) {
  return (
    <Image
      alt="Maven AGI Logo"
      className={className}
      width={width}
      height={height}
      src={version === "black" ? imgMaven : imgMavenPurple}
    />
  );
}
