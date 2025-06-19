// components/RequestBlock.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "./ui/input";
import { useSavedRequests, SavedRequest } from "./context/SavedRequestsContext";
import { MethodSelector } from "./collections/MethodSelector";

interface RequestBlockProps {
  tabId: string;
  updateTabRequestLabel: (id: string, requestLabel: string) => void;
  requestLabel?: string;
  savedRequestId?: string;
}

export const RequestBlock = ({ 
  tabId, 
  updateTabRequestLabel, 
  requestLabel = "",
  savedRequestId 
}: RequestBlockProps) => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<null | string>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState(requestLabel);
  const { saveRequest, getRequestById } = useSavedRequests();

  // Load saved request data if savedRequestId is provided
  useEffect(() => {
    if (savedRequestId) {
      const savedRequest = getRequestById(savedRequestId);
      if (savedRequest) {
        setMethod(savedRequest.method);
        setUrl(savedRequest.url);
        setBody(savedRequest.body || "");
        setLabel(savedRequest.name);
        updateTabRequestLabel(tabId, savedRequest.name);
      }
    }
  }, [savedRequestId, getRequestById, updateTabRequestLabel, tabId]);

  const handleSend = async () => {
    try {
      setLoading(true);
      setStatusCode(null);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method !== "GET" && method !== "DELETE" ? body : undefined,
      });

      setStatusCode(res.status);
      const text = await res.text();
      setResponse(text);
    } catch (error) {
      setResponse("❌ Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRequest = () => {
    if (!url.trim()) {
      alert("Please enter a URL before saving");
      return;
    }

    const requestName = label.trim() || "Untitled Request";
    
    saveRequest({
      name: requestName,
      method,
      url,
      body: body.trim() || undefined,
    });

    // Update the tab label if it was empty
    if (!label.trim()) {
      updateTabRequestLabel(tabId, requestName);
    }
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
    updateTabRequestLabel(tabId, e.target.value);
  };

  const getStatusColor = (status: number | null) => {
    if (!status) return "";
    if (status >= 200 && status < 300) return "text-green-400";
    if (status >= 300 && status < 400) return "text-blue-400";
    if (status >= 400 && status < 500) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <Input
            className="border-none text-4xl font-bold placeholder:font-bold text-neutral-400 w-1/3"
            placeholder="Untitled request"
            value={label}
            onChange={handleLabelChange}
          />
          <Button
            className="text-md m-2 bg-neutral-500 hover:bg-neutral-600"
            onClick={handleSaveRequest}
          >
            Save request
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <MethodSelector value={method} onChange={setMethod} />
          <input
            className="w-full px-4 py-2 rounded-md bg-[#21262d] text-white"
            placeholder="Enter URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button
            onClick={handleSend}
            className="text-md m-2 bg-violet-700"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>

      <textarea
        className="w-full px-4 py-2 rounded-md bg-[#21262d] text-white"
        placeholder="Body (JSON)..."
        rows={6}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      {(response || statusCode) && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span>Response:</span>
            {statusCode && (
              <span className={`font-mono ${getStatusColor(statusCode)}`}>
                Status: {statusCode}
              </span>
            )}
          </div>
          <pre className="bg-[#1a1d23] text-green-400 text-sm p-3 rounded-md whitespace-pre-wrap">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
};
