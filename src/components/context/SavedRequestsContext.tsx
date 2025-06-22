"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface SavedRequest {
  id: number;
  name: string;
  method: string;
  url: string;
  body?: any; // Can be object or string
  preRequestScript?: string;
  postRequestScript?: string;
  collection_id?: number;
  createdAt: string; // API sends string
}

interface SavedRequestsContextType {
  savedRequests: SavedRequest[];
  setRequests: (requests: SavedRequest[]) => void;
  addRequest: (request: SavedRequest) => void;
  updateRequest: (id: number, updatedRequest: Partial<SavedRequest>) => void;
  deleteRequest: (id: number) => void;
  getRequestById: (id: number) => SavedRequest | undefined;
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
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);

  const setRequests = (requests: SavedRequest[]) => {
    const formattedRequests = requests.map(r => ({
      ...r,
      body: r.body && typeof r.body === 'object' ? JSON.stringify(r.body, null, 2) : r.body,
    }));
    setSavedRequests(formattedRequests);
  };

  const addRequest = (request: SavedRequest) => {
    const formattedRequest = {
      ...request,
      body: request.body && typeof request.body === 'object' ? JSON.stringify(request.body, null, 2) : request.body,
    };
    setSavedRequests(prev => [...prev, formattedRequest]);
  };

  const updateRequest = (id: number, updatedRequest: Partial<SavedRequest>) => {
    setSavedRequests(prev =>
      prev.map(req =>
        req.id === id ? { ...req, ...updatedRequest } : req
      )
    );
  };

  const deleteRequest = (id: number) => {
    setSavedRequests(prev => prev.filter(req => req.id !== id));
  };

  const getRequestById = (id: number) => {
    return savedRequests.find(req => req.id === id);
  };

  return (
    <SavedRequestsContext.Provider
      value={{
        savedRequests,
        setRequests,
        addRequest,
        updateRequest,
        deleteRequest,
        getRequestById,
      }}
    >
      {children}
    </SavedRequestsContext.Provider>
  );
}; 