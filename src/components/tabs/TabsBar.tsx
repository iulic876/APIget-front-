"use client";

import { useTabs } from "./TabsContext";
import clsx from "clsx";

export const TabsBar = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useTabs();

  return (
    <div className="flex bg-[#161b22] border-b border-[#2a2f38] h-10 items-center px-4 space-x-2 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={clsx(
            "flex items-center px-3 py-1 text-sm rounded-md space-x-2 max-w-xs",
            activeTabId === tab.id
              ? "bg-[#21262d] text-white"
              : "text-gray-400 hover:text-white hover:bg-[#1e242c]"
          )}
        >
          {/* Make label clickable */}
          <button
            onClick={() => setActiveTab(tab.id)}
            className="truncate max-w-[140px]"
          >
            {tab.label}
          </button>

          {/* ❌ Close button */}
          <button
            onClick={() => closeTab(tab.id)}
            className="text-neutral-600 hover:text-red-300"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
