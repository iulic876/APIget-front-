"use client";

import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Home, Book, FolderKanban, History, Settings, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Router from "next/router";
import { ClientTeamSwitcher } from "./ClientTeamSwitcher";
import { ClientNavDropdown } from "./ClientNavDropdown";
import { ClientOnly } from "../ClientOnly";

export const MainRootLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  return (
    <div className="flex h-screen">
      <aside className="w-[60px] bg-[#272c34] text-white flex flex-col items-center py-4 space-y-6">
        <nav className="flex flex-col gap-6 mt-12">
          <Home size={20} onClick={() => router.push("/product/collections")} />
          <Book size={20} onClick={() => router.push("/product/flow")} />
          <FolderKanban
            size={20}
            onClick={() => router.push("/product/user-model")}
          />
          <History size={20} onClick={() => router.push("/product/working")} />
          <Settings size={20} onClick={() => router.push("/product/settings")} />
          <Users size={20} onClick={() => router.push("/product/working")} />
        </nav>
      </aside>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-12 bg-[#272c34] text-white flex items-center px-4">
          <div className="w-1/4">
            <ClientOnly
              fallback={
                <div className="w-full h-8 bg-gray-600 rounded animate-pulse" />
              }
            >
              <ClientTeamSwitcher />
            </ClientOnly>
          </div>

          <div className="ml-auto text-xs">
            <ClientOnly
              fallback={
                <div className="w-20 h-6 bg-gray-600 rounded animate-pulse" />
              }
            >
              <ClientNavDropdown />
            </ClientOnly>
          </div>
        </header>
        <main className="flex-1 bg-[#161b22] overflow-hidden">{children}</main>
      </div>
    </div>
  );
};
