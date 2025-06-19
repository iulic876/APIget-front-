"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  body?: string;
  createdAt: Date;
}

interface SavedRequestsContextType {
  savedRequests: SavedRequest[];
  saveRequest: (request: Omit<SavedRequest, 'id' | 'createdAt'>) => void;
  deleteRequest: (id: string) => void;
  getRequestById: (id: string) => SavedRequest | undefined;
}

const SavedRequestsContext = createContext<SavedRequestsContextType | undefined>(undefined);

export const useSavedRequests = () => {
  const context = useContext(SavedRequestsContext);
  if (!context) {
    throw new Error("useSavedRequests must be used within a SavedRequestsProvider");
  }
  return context;
};

export const SavedRequestsProvider = ({ children }: { children: ReactNode }) => {
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([
    {
      id: "mock-1",
      name: "Get Users",
      method: "GET",
      url: "https://jsonplaceholder.typicode.com/users",
      createdAt: new Date(),
    },
    {
      id: "mock-2", 
      name: "Create Post",
      method: "POST",
      url: "https://jsonplaceholder.typicode.com/posts",
      body: JSON.stringify({
        title: "Sample Post",
        body: "This is a sample post body",
        userId: 1
      }, null, 2),
      createdAt: new Date(),
    },
  ]);

  const saveRequest = (request: Omit<SavedRequest, 'id' | 'createdAt'>) => {
    const newRequest: SavedRequest = {
      ...request,
      id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    
    setSavedRequests(prev => [...prev, newRequest]);
    console.log("💾 Saved request:", newRequest);
  };

  const deleteRequest = (id: string) => {
    setSavedRequests(prev => prev.filter(req => req.id !== id));
  };

  const getRequestById = (id: string) => {
    return savedRequests.find(req => req.id === id);
  };

  return (
    <SavedRequestsContext.Provider
      value={{
        savedRequests,
        saveRequest,
        deleteRequest,
        getRequestById,
      }}
    >
      {children}
    </SavedRequestsContext.Provider>
  );
}; 