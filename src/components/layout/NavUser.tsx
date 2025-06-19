"use client";

import {
  IconUserCircle,
  IconSettings,
  IconLogout,
  IconRocket,
  IconHelp,
  IconBrush,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ApiService from "@/services/api";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export function NavDropdown() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          router.push('/login');
          return;
        }

        const response = await ApiService.get(`/auth/me/${userId}`);
        
        if (response.ok && response.data) {
          // The user data is nested inside response.data.user
          setUser(response.data.user);
        } else {
          console.error('Failed to fetch user data');
          router.push('/login');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return (
      <Button variant="ghost" className="rounded-full p-0 size-8">
        <Avatar className="h-8 w-8">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  if (!user) {
    return (
      <Button variant="ghost" className="rounded-full p-0 size-8">
        <Avatar className="h-8 w-8">
          <AvatarFallback>!</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="rounded-full p-0 size-8">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 bg-[#1a1b20] text-white border border-[#2e2f3e] shadow-lg rounded-xl p-2"
      >
        <div className="px-3 py-2">
          <p className="text-sm font-medium truncate">{user.email}</p>
          <p className="text-xs text-gray-400">{user.name}</p>
        </div>

        <DropdownMenuSeparator className="bg-[#2e2f3e]" />

        <DropdownMenuItem className="gap-2 text-sm hover:bg-[#2e2f3e]">
          <IconRocket size={16} />
          Upgrade plan
        </DropdownMenuItem>

        <DropdownMenuItem className="gap-2 text-sm hover:bg-[#2e2f3e]">
          <IconBrush size={16} />
          Personalize
        </DropdownMenuItem>

        <DropdownMenuItem className="gap-2 text-sm hover:bg-[#2e2f3e]">
          <IconSettings size={16} />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#2e2f3e]" />

        <DropdownMenuItem className="gap-2 text-sm hover:bg-[#2e2f3e]">
          <IconHelp size={16} />
          Help
        </DropdownMenuItem>

        <DropdownMenuItem 
          className="gap-2 text-sm text-[#f87171] hover:bg-[#2e2f3e]"
          onClick={handleLogout}
        >
          <IconLogout size={16} />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default { NavDropdown };
