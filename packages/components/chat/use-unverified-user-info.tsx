import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const useUnverifiedUserInfo = () => {
  const [unverifiedUserInfo, setUnverifiedUserInfo] = useState<
    Record<string, string>
  >({});
  const searchParams = useSearchParams();

  useEffect(() => {
    const unverifiedUserInfoString: string | null =
      searchParams.get('unverifiedUserInfo');
    if (unverifiedUserInfoString) {
      try {
        setUnverifiedUserInfo(JSON.parse(unverifiedUserInfoString));
      } catch (error) {
        console.log('Failed to parse unverifiedUserInfo:', error);
      }
    }
  }, [searchParams]);

  return unverifiedUserInfo;
};
