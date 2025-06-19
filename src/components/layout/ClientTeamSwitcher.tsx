'use client';

import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

// Dynamically import TeamSwitcher with no SSR
const TeamSwitcher = dynamic(() => import('./TeamSwitcher').then(mod => mod.TeamSwitcher), {
  ssr: false,
  loading: () => (
    <Button
      variant="ghost"
      className="w-full justify-start px-3 py-2.5 bg-[#1a1b20] text-white border border-[#2e2f3e]"
      disabled
    >
      <Building2 className="mr-2 h-4 w-4" />
      <div className="flex flex-col items-start">
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </Button>
  )
});

export function ClientTeamSwitcher() {
  return <TeamSwitcher />;
} 