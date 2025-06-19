"use client";

import { useTabs } from "./TabsContext";
import { useState } from "react";
import { Button } from "../ui/button";
import { RequestBlock } from "../RequestBlock";

let newTabCounter = 1;

const endpoints = [
  {
    id: "get-users",
    label: "GET /users",
    content: <div>🔵 GET /users endpoint</div>,
  },
  {
    id: "post-login",
    label: "POST /login",
    content: <div>🟢 POST /login endpoint</div>,
  },
  {
    id: "delete-account",
    label: "DELETE /account",
    content: <div>🔴 DELETE /account endpoint</div>,
  },
  {
    id: "put-settings",
    label: "PUT /settings",
    content: <div>🟡 PUT /settings endpoint</div>,
  },
  {
    id: "get-profile",
    label: "GET /profile",
    content: <div>🟣 GET /profile endpoint</div>,
  },
];

export const TabOpener = () => {
  const { openTab, updateTabRequestLabel } = useTabs();

  const handleNewTab = () => {
    const newTabId = `new-tab-${newTabCounter++}`;
    openTab({
      id: newTabId,
      label: "Untitled Request",
      content: (
        <RequestBlock tabId={newTabId} updateTabRequestLabel={updateTabRequestLabel} requestLabel="" />
      ),
    });
  };

  return (
    <div className="p-4 flex flex-col gap-2">
      <button
        onClick={handleNewTab}
        className="text-left text-sm text-purple-400 hover:text-white border border-dashed border-purple-600 px-4 py-2 rounded-md"
      >
        + New
      </button>

      {endpoints.map((ep) => (
        <button
          key={ep.id}
          onClick={() => openTab(ep)}
          className="text-left text-sm text-white bg-[#21262d] hover:bg-[#2a2f38] px-4 py-2 rounded-md"
        >
          {ep.label}
        </button>
      ))}
    </div>
  );
};
