'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

export function PostHogProvider() {
  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (posthogKey) {
      posthog.init(posthogKey, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: 'history_change'
      });
    }
  }, []);

  return null;
} 