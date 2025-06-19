'use client';

import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Dynamically import NavDropdown with no SSR
const NavDropdown = dynamic(() => import('./NavUser').then(mod => mod.NavDropdown), {
  ssr: false,
  loading: () => (
    <Button variant="ghost" className="rounded-full p-0 size-8">
      <Avatar className="h-8 w-8">
        <AvatarFallback>...</AvatarFallback>
      </Avatar>
    </Button>
  )
});

export function ClientNavDropdown() {
  return <NavDropdown />;
} 