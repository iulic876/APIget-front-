'use client'
import { useTabs } from "../tabs/TabsContext";
import { useSavedRequests, SavedRequest } from "../context/SavedRequestsContext";
import { Book, MoreVertical, ChevronRight, ChevronDown } from "lucide-react";
import { RequestBlock } from "../RequestBlock";
import { Button } from "../ui/button";
import { ImportModal } from "../collections/ImportDialog";
import { useState, useEffect, useRef } from "react";
import ApiService from "@/services/api";
import { SaveRequestDialog } from "../collections/SaveRequestDialog";
import { CreateCollectionDialog } from "../collections/CreateCollectionDialog";
import { SearchComponent } from "../SearchComponent";

let newTabCounter = 1;

interface Collection {
  id: number;
  name: string;
  requests: SavedRequest[];
}

export const ChildrenLayout = () => {
  const { openTab, updateTabRequestLabel } = useTabs();
  const { savedRequests, deleteRequest, addRequest, setRequests } = useSavedRequests();
  const [open, setOpen] = useState(false);
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [currentRequestData, setCurrentRequestData] = useState<any>(null);
  const [expandedCollections, setExpandedCollections] = useState<Set<number>>(new Set());


  const fetchCollections = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    try {
      const response = await ApiService.get(`/collections?userId=${userId}`);
      if (response.ok) {
        const collectionsArray = response.data.collections || response.data;
        if (Array.isArray(collectionsArray)) {
          setCollections(collectionsArray);
          // Now, extract all requests from all collections and update the SavedRequestsContext
          const allRequests = collectionsArray.flatMap(collection => collection.requests || []);
          setRequests(allRequests);
        } else {
          setCollections([]);
          setRequests([]);
        }
      } else {
        setCollections([]);
        setRequests([]);
      }
    } catch (error) {
      console.error("Error fetching collections", error);
      setCollections([]);
      setRequests([]);
    }
  };

  const toggleCollection = (collectionId: number) => {
    setExpandedCollections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // Debug: Track search modal state
  useEffect(() => {
    console.log('Search modal state changed:', isSearchOpen);
  }, [isSearchOpen]);

  // Add keyboard shortcut listener for Command+N
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Command+N (Mac) or Ctrl+N (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault(); // Prevent default browser behavior
        handleNewRequest();
      }
      
      // Check for Command+C (Mac) or Ctrl+C (Windows/Linux) to create collection
      if ((event.metaKey || event.ctrlKey) && event.key === 'c') {
        // Only trigger if not in an input field to avoid interfering with copy functionality
        const target = event.target as HTMLElement;
        if (!target || (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable)) {
          event.preventDefault(); // Prevent default browser behavior
          setIsCreateCollectionOpen(true);
        }
      }

      // Check for Command+K (Mac) or Ctrl+K (Windows/Linux) to open search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        console.log('Command+K pressed - opening search');
        event.preventDefault(); // Prevent default browser behavior
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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

  const openSaveDialog = (requestData: any) => {
    setCurrentRequestData(requestData);
    setIsSaveModalOpen(true);
  };

  const handleSaveRequest = async (collectionId: number) => {
    if (!currentRequestData) return;

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      console.error("User not found");
      return;
    }
    
    const payload = {
      ...currentRequestData,
      collection_id: collectionId
    };

    try {
      const response = await ApiService.post(`/requests?userId=${userId}`, payload);
      if (response.ok) {
        console.log("Request saved successfully", response.data);
        addRequest(response.data.request);
        setIsSaveModalOpen(false);
        setCurrentRequestData(null);
      } else {
        console.error("Failed to save request", response.error);
      }
    } catch (error) {
      console.error("Error saving request", error);
    }
  };

  const handleNewRequest = () => {
    const newTabId = `new-tab-${newTabCounter++}`;
    openTab({
      id: newTabId,
      label: "Untitled Request",
      content: (
        <RequestBlock 
          tabId={newTabId} 
          updateTabRequestLabel={updateTabRequestLabel} 
          requestLabel="" 
          onSave={openSaveDialog} 
        />
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
          onSave={openSaveDialog}
        />
      ),
    });
  };

  const handleDeleteRequest = (id: number) => {
    deleteRequest(id);
    setOpenDropdownId(null);
  };

  const toggleDropdown = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleImport = async (requests: any[]) => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      console.error("User not found");
      return;
    }
    console.log("📦 Importing endpoints for user:", userId, requests);
    // Here you would typically make an API call to a bulk import endpoint
    // For now, we just log it.
  };

  // Handle search result selection
  const handleSearchResult = (result: any) => {
    console.log('Search result selected:', result);
    if (result.type === 'request') {
      // Find the request in collections
      const request = collections
        .flatMap(collection => collection.requests)
        .find(req => req.id === parseInt(result.id.replace('request-', '')));
      
      if (request) {
        handleOpenSavedRequest(request);
      }
    } else if (result.type === 'collection') {
      // Expand the collection
      const collectionId = parseInt(result.id.replace('collection-', ''));
      setExpandedCollections(prev => {
        const newSet = new Set(prev);
        newSet.add(collectionId);
        return newSet;
      });
    }
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
              className="text-sm text-purple-400 hover:text-white border border-dashed border-purple-600 px-3 py-2 rounded-md"
            >
              + New
            </button>
            <Button 
              onClick={() => setIsCreateCollectionOpen(true)}
              className="text-sm bg-neutral-600 hover:bg-neutral-700"
            >
              New Collection
            </Button>
            {/* <Button 
              onClick={() => setOpen(true)}
              className="text-sm bg-neutral-600 hover:bg-neutral-700"
            >
              Import
            </Button> */}
          </div>

          {/* Collections */}
          <div className="w-full mt-4">
            <h3 className="text-md font-semibold mb-2">Collections</h3>
            {collections.length > 0 ? (
              <div className="space-y-1">
                {collections.map((collection) => (
                  <div key={collection.id}>
                    <div
                      onClick={() => toggleCollection(collection.id)}
                      className="flex items-center justify-between p-2 rounded-md bg-[#21262d] hover:bg-[#2a2f38] cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        {expandedCollections.has(collection.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span className="text-sm truncate">{collection.name}</span>
                      </div>
                    </div>
                    {expandedCollections.has(collection.id) && (
                      <div className="pl-6 pt-1 space-y-1">
                        {(collection.requests || [])
                          .map(request => (
                            <div
                              key={request.id}
                              onClick={() => handleOpenSavedRequest(request)}
                              className="flex items-center justify-between p-2 rounded-md bg-[#2a2f38] hover:bg-[#3a3f48] cursor-pointer group relative"
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
                              </div>
                              <div className="relative">
                                <button
                                  onClick={(e) => toggleDropdown(e, request.id)}
                                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity p-1"
                                >
                                  <MoreVertical size={14} />
                                </button>
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
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 pl-2">No collections yet.</p>
            )}
          </div>
        </div>

        <ImportModal
          open={open}
          onClose={handleClose}
          onSubmit={handleImport}
        />
        <SaveRequestDialog 
          open={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          collections={collections}
          onSave={handleSaveRequest}
        />
        <CreateCollectionDialog
          open={isCreateCollectionOpen}
          onClose={() => setIsCreateCollectionOpen(false)}
          onCollectionCreated={fetchCollections}
        />
        <SearchComponent
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectResult={handleSearchResult}
          collections={collections}
        />
      </aside>
    </div>
  );
};
