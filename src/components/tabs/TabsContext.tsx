"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
  requestLabel?: string;
};

type TabsContextType = {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (tab: Tab) => void;
  setActiveTab: (id: string) => void;
  closeTab: (id: string) => void;
  updateTabLabel: (id: string, label: string) => void;
  updateTabRequestLabel: (id: string, requestLabel: string) => void;
  reorderTabs: (oldIndex: number, newIndex: number) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const useTabs = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("useTabs must be used within TabsProvider");
  return ctx;
};

export const TabsProvider = ({ children }: { children: ReactNode }) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openTab = (tab: Tab) => {
    setTabs((prev) => {
      const exists = prev.find((t) => t.id === tab.id);
      if (exists) return prev;
      return [...prev, tab];
    });
    setActiveTabId(tab.id);
  };

  const setActiveTab = (id: string) => {
    setActiveTabId(id);
  };

  const closeTab = (id: string) => {
    setTabs((prev) => prev.filter((tab) => tab.id !== id));

    setActiveTabId((currentId) => {
      if (currentId === id) {
        const remaining = tabs.filter((tab) => tab.id !== id);
        return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
      }
      return currentId;
    });
  };

  const updateTabLabel = (id: string, label: string) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, label } : tab))
    );
  };

  const updateTabRequestLabel = (id: string, requestLabel: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === id
          ? { ...tab, requestLabel, label: requestLabel || "Untitled Request" }
          : tab
      )
    );
  };

  const reorderTabs = (oldIndex: number, newIndex: number) => {
    setTabs((prev) => {
      const newTabs = [...prev];
      const [removed] = newTabs.splice(oldIndex, 1);
      newTabs.splice(newIndex, 0, removed);
      return newTabs;
    });
  };

  return (
    <TabsContext.Provider
      value={{
        tabs,
        activeTabId,
        openTab,
        setActiveTab,
        closeTab,
        updateTabLabel,
        updateTabRequestLabel,
        reorderTabs,
      }}
    >
      {children}
    </TabsContext.Provider>
  );
};
