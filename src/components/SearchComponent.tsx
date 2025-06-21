"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Folder, FileText, ArrowUp, ArrowDown, Command } from "lucide-react";
import { useSavedRequests } from "./context/SavedRequestsContext";

interface SearchResult {
  id: string;
  type: 'collection' | 'request';
  name: string;
  method?: string;
  url?: string;
  collectionName?: string;
}

interface SearchComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: SearchResult) => void;
  collections: Array<{
    id: number;
    name: string;
    requests: Array<{
      id: number;
      name: string;
      method: string;
      url: string;
    }>;
  }>;
}

export const SearchComponent = ({ isOpen, onClose, onSelectResult, collections }: SearchComponentProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input when component opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search through collections
    collections.forEach(collection => {
      if (collection.name.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: `collection-${collection.id}`,
          type: 'collection',
          name: collection.name,
        });
      }

      // Search through requests in this collection
      collection.requests.forEach(request => {
        if (
          request.name.toLowerCase().includes(lowerQuery) ||
          request.url.toLowerCase().includes(lowerQuery) ||
          request.method.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            id: `request-${request.id}`,
            type: 'request',
            name: request.name,
            method: request.method,
            url: request.url,
            collectionName: collection.name,
          });
        }
      });
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
    setSelectedIndex(0);
  }, [query, collections]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            onSelectResult(results[selectedIndex]);
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, onSelectResult]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-600';
      case 'POST': return 'bg-blue-600';
      case 'PUT': return 'bg-yellow-600';
      case 'DELETE': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center pt-20 z-50 animate-in fade-in duration-300">
      <div className="bg-white border border-gray-200 rounded-lg shadow-2xl w-full max-w-2xl mx-4 animate-in slide-in-from-top-4 duration-300 ease-out">
        {/* Search Input */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-600 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search collections and requests..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-black placeholder-gray-500 outline-none text-lg"
          />
          <button
            onClick={onClose}
            className="ml-3 p-1 hover:bg-gray-100 rounded transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div ref={resultsRef}>
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`p-4 cursor-pointer border-l-2 transition-all duration-200 ease-out ${
                    index === selectedIndex
                      ? "bg-blue-50 border-blue-500 scale-[1.02]"
                      : "border-transparent hover:bg-gray-50 hover:scale-[1.01]"
                  }`}
                  onClick={() => {
                    onSelectResult(result);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3">
                    {result.type === "collection" ? (
                      <Folder className="w-5 h-5 text-blue-600" />
                    ) : (
                      <FileText className="w-5 h-5 text-green-600" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-black font-medium truncate">
                          {result.name}
                        </span>
                        {result.method && (
                          <span
                            className={`text-xs px-2 py-1 rounded font-mono text-white ${getMethodColor(
                              result.method
                            )}`}
                          >
                            {result.method}
                          </span>
                        )}
                      </div>
                      
                      {result.type === "request" && (
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="truncate">{result.url}</span>
                          {result.collectionName && (
                            <span className="text-gray-500 ml-2">
                              • {result.collectionName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {index === selectedIndex && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 animate-in fade-in duration-200">
                        <span>Press Enter</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="p-8 text-center text-gray-500 animate-in fade-in duration-300">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 animate-in fade-in duration-300">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Start typing to search collections and requests</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>Enter Select</span>
            <span>Esc Close</span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 