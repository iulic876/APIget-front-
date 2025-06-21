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
import Cookies from 'js-cookie';

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
          const user = response.data.user;

          // If the user doesn't have an avatar, generate one.
          if (!user.avatar) {
            const nameForAvatar = user.name.split(' ').join('+');
            user.avatar = `https://ui-avatars.com/api/?name=${nameForAvatar}&background=random`;
          }
          
          setUser(user);
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
    // Clear all site data
    localStorage.clear();
    Cookies.remove('auth_token', { path: '/' });

    // Redirect to login
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
          <IconSettings size={16} href="/settings"/>
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#2e2f3e]" />

       

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
