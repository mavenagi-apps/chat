import Image from "next/image";

interface ChatHeaderProps {
  logo?: string;
}

export function ChatHeader({ logo }: ChatHeaderProps) {
  const defaultLogo =
    "https://app.mavenagi.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2Fage_CSMoGtyyQNJ0z8XzyMXK2Jbk%2Flogo%3F1730414949621&w=256&q=75";

  return (
    <div role="banner" className="border-b border-gray-300 bg-white md:block">
      <div className="text-md flex p-5 font-medium text-gray-950">
        <Image
          src={logo || defaultLogo}
          alt="Logo"
          width={98}
          height={24}
          className="h-8 w-auto"
        />
      </div>
    </div>
  );
}
