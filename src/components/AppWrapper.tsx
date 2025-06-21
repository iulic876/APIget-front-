"use client";

import { useEffect, useState } from 'react';

interface AppWrapperProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Apply global styles only after client-side hydration
  useEffect(() => {
    if (isMounted) {
      document.body.className = "antialiased min-h-screen";
    }
  }, [isMounted]);

  return (
    <div className={isMounted ? "antialiased min-h-screen" : ""}>
      {children}
    </div>
  );
} 