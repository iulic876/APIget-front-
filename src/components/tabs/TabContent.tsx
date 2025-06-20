"use client";

import { useTabs } from "./TabsContext";
import {EmptyTab} from "./EmptyTab"

export const TabContent = () => {
  const { tabs, activeTabId } = useTabs();

  return (
    <div className="p-6 text-white">
      {tabs.length === 0 ? (
        <div className="text-gray-500 flex items-center w-full h-full mt-20">
          <EmptyTab/>
        </div>
      ) : (
        tabs.map((tab) => (
          <div
            key={tab.id}
            style={{ display: tab.id === activeTabId ? "block" : "none" }}
          >
            {tab.content}
          </div>
        ))
      )}
    </div>
  );
};
