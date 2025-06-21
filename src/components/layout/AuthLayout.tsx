"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const authToken = Cookies.get('auth_token');
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

      if (isAuthPage) {
        if (authToken) {
          router.replace('/');
        }
      } else {
        if (!authToken) {
          router.replace('/login');
        }
      }
    }
  }, [pathname, router, isClient]);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
} 