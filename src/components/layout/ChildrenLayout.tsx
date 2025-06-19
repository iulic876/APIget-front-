'use client'
import { useTabs } from "../tabs/TabsContext";
import { useSavedRequests } from "../context/SavedRequestsContext";
import { Book, MoreVertical } from "lucide-react";
import { RequestBlock } from "../RequestBlock";
import { Button } from "../ui/button";
import { ImportModal } from "../collections/ImportDialog";
import { useState, useEffect, useRef } from "react";

let newTabCounter = 1;

export const ChildrenLayout = () => {
  const { openTab, updateTabRequestLabel } = useTabs();
  const { savedRequests, deleteRequest } = useSavedRequests();
  const [open, setOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  const handleNewRequest = () => {
    const newTabId = `new-tab-${newTabCounter++}`;
    openTab({
      id: newTabId,
      label: "Untitled Request",
      content: (
        <RequestBlock tabId={newTabId} updateTabRequestLabel={updateTabRequestLabel} requestLabel="" />
      ),
    });
  };

  const handleOpenSavedRequest = (savedRequest: any) => {
    const newTabId = `saved-${savedRequest.id}`;
    openTab({
      id: newTabId,
      label: savedRequest.name,
      content: (
        <RequestBlock 
          tabId={newTabId} 
          updateTabRequestLabel={updateTabRequestLabel} 
          requestLabel={savedRequest.name}
          savedRequestId={savedRequest.id}
        />
      ),
    });
  };

  const handleDeleteRequest = (id: string) => {
    deleteRequest(id);
    setOpenDropdownId(null);
  };

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleImport = (
    requests: {
      id: string;
      method: string;
      path: string;
      summary: string;
      tag: string;
    }[]
  ) => {
    console.log("📦 Imported endpoints:", requests);
  };

  return (
    <div className="bg-[#272c34]" ref={dropdownRef}>
      <aside className="w-[260px] text-white p-4 space-y-4 bg-[#161b22] rounded-tl-2xl h-full overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">APIs</h2>

        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 text-sm text-white font-medium mb-2">
            <Book size={16} />
            Endpoints
          </div>

          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={handleNewRequest}
              className="text-sm text-purple-400 hover:text-white border border-dashed border-purple-600 px-3 py-1 rounded-md"
            >
              + New
            </button>
            <Button 
              onClick={() => setOpen(true)}
              className="text-sm bg-neutral-600 hover:bg-neutral-700"
            >
              Import Collection
            </Button>
          </div>

          {/* Saved Requests */}
          {savedRequests.length > 0 && (
            <div className="w-full">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Saved Requests</h3>
              <div className="space-y-1">
                {savedRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => handleOpenSavedRequest(request)}
                    className="flex items-center justify-between p-2 rounded-md bg-[#21262d] hover:bg-[#2a2f38] cursor-pointer group relative"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-1 py-0.5 rounded font-mono ${
                          request.method === 'GET' ? 'bg-green-600' :
                          request.method === 'POST' ? 'bg-blue-600' :
                          request.method === 'PUT' ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}>
                          {request.method}
                        </span>
                        <span className="text-sm truncate">{request.name}</span>
                      </div>
                      <div className="text-xs text-gray-400 truncate mt-1">
                        {request.url}
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => toggleDropdown(e, request.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity p-1"
                      >
                        <MoreVertical size={14} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openDropdownId === request.id && (
                        <div className="absolute right-0 top-6 bg-[#1a1d23] border border-[#2e2f3e] rounded-md shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRequest(request.id);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#2a2f38] hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <ImportModal
          open={open}
          onClose={handleClose}
          onSubmit={handleImport}
        />
      </aside>
    </div>
  );
};
