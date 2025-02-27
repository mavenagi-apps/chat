import Image from "next/image";
import { useState, useMemo } from "react";

interface ChatHeaderProps {
  logo?: string;
  fallbackLogo?: string;
}

export function ChatHeader({ logo, fallbackLogo }: ChatHeaderProps) {
  const defaultLogo =
    "https://app.mavenagi.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2Fage_CSMoGtyyQNJ0z8XzyMXK2Jbk%2Flogo%3F1730414949621&w=256&q=75";

  // Memoize the filtered logo sources array to prevent unnecessary recalculations
  const initialSources = useMemo(() => {
    return [logo, fallbackLogo, defaultLogo].filter(
      (src): src is string => Boolean(src) && src !== "",
    );
  }, [logo, fallbackLogo]);

  // Initialize state with memoized values for optimal performance
  const [logoSources, setLogoSources] = useState<string[]>(initialSources);
  const [currentSrc, setCurrentSrc] = useState<string>(initialSources[0] || "");

  /**
   * Handles image loading errors by removing the current source
   * and attempting to load the next available source in the fallback chain.
   */
  const handleError = () => {
    // Clone and update the sources array to maintain immutability
    const updatedSources = [...logoSources];
    updatedSources.shift();

    setLogoSources(updatedSources);

    // Attempt to load the next source if available
    if (updatedSources.length > 0) {
      setCurrentSrc(updatedSources[0]);
    }
  };

  return (
    <div role="banner" className="border-b border-gray-300 bg-white md:block">
      <div className="text-md flex p-5 font-medium text-gray-950">
        {currentSrc && (
          <Image
            src={currentSrc}
            alt="Logo"
            width={98}
            height={24}
            className="h-8 w-auto"
            onError={handleError}
          />
        )}
      </div>
    </div>
  );
}
