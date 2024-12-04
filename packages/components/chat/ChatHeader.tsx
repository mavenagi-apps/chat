import Image from 'next/image';

interface ChatHeaderProps {
  logoUrl?: string;
}

export function ChatHeader({ logoUrl }: ChatHeaderProps) {
  const defaultLogo =
    'https://app.mavenagi.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2Fage_CSMoGtyyQNJ0z8XzyMXK2Jbk%2Flogo%3F1730414949621&w=256&q=75';

  return (
    <div className='border-b border-gray-300 bg-white md:block'>
      <div className='text-md flex p-5 font-medium text-gray-950'>
        <Image src={logoUrl || defaultLogo} alt='Logo' width={98} height={24} />
      </div>
    </div>
  );
}
