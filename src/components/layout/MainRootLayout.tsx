"use client";

import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Home, Book, FolderKanban, History, Settings, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Router from "next/router";
import { ClientTeamSwitcher } from "./ClientTeamSwitcher";
import { ClientNavDropdown } from "./ClientNavDropdown";

export const MainRootLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  return (
    <div className="flex h-screen">
      <aside className="w-[60px] bg-[#272c34] text-white flex flex-col items-center py-4 space-y-6">
       
        <nav className="flex flex-col gap-6 mt-12">
          <Home size={20} onClick={() => router.push("/collections")} />
          <Book size={20} onClick={() => router.push("/flow")} />
          <FolderKanban size={20} />
          <History size={20} />
          <Settings size={20} />
          <Users size={20} />
        </nav>
      </aside>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-12 bg-[#272c34] text-white flex items-center px-4">
          <div className="w-1/4">
            <ClientTeamSwitcher />
          </div>

          <div className="ml-auto text-xs">
            <ClientNavDropdown />
          </div>
        </header>
        <main className="flex-1 bg-[#161b22] overflow-hidden">{children}</main>
      </div>
    </div>
  );
};
