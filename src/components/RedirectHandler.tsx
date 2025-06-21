"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const RedirectHandler = () => {
  const router = useRouter();

  useEffect(() => {
    const authToken = Cookies.get('auth_token');
    if (authToken) {
      router.replace('/product/collections');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return null; // This component renders nothing.
};

export default RedirectHandler; 