"use client";

import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Home, Book, FolderKanban, History, Settings, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Router from "next/router";

export const MainRootLayout = ({ children }: { children: React.ReactNode }) => {

  const router = useRouter()
  return (
    <div className="flex h-screen">
      <aside className="w-[60px] bg-[#272c34] text-white flex flex-col items-center py-4 space-y-6">
        <div className="w-10 h-10 bg-white rounded-lg" />
        <nav className="flex flex-col gap-6 mt-6">
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
          <h1 className="text-sm font-medium">APIgets</h1>
          <div className="ml-auto text-xs">User</div>
        </header>
        <main className="flex-1 bg-[#161b22] overflow-hidden">{children}</main>
      </div>
    </div>
  );
};
