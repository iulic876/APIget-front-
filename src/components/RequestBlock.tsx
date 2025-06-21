// components/RequestBlock.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "./ui/input";
import { useSavedRequests, SavedRequest } from "./context/SavedRequestsContext";
import { MethodSelector } from "./collections/MethodSelector";
import { VariableInput } from "./request/components/VariableInput";
import ApiService from "@/services/api";

interface WorkspaceVariable {
  id: number;
  variable_key: string;
  value: string;
}

interface RequestBlockProps {
  tabId: string;
  updateTabRequestLabel: (tabId: string, newLabel: string) => void;
  requestLabel: string;
  savedRequestId?: number;
  onSave: (requestData: Omit<SavedRequest, 'id' | 'createdAt'> & { savedRequestId?: number }) => void;
}

export const RequestBlock = ({ tabId, updateTabRequestLabel, requestLabel, savedRequestId, onSave }: RequestBlockProps) => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<null | string>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState(requestLabel);
  const { getRequestById } = useSavedRequests();
  const inputRef = useRef<HTMLInputElement>(null);

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
  
  const substituteVariables = (text: string, currentVariables: WorkspaceVariable[]): string => {
    if (!text) return "";
    
    let substitutedText = text;

    // Substitute static variables first
    if (currentVariables.length) {
      currentVariables.forEach(variable => {
        const regex = new RegExp(`\\{\\{${variable.variable_key}\\}\\}`, 'g');
        substitutedText = substitutedText.replace(regex, variable.value);
      });
    }

    // Substitute dynamic variables
    substitutedText = substitutedText.replace(/\{\{\$randomInt\}\}/g, String(Math.floor(Math.random() * 1000)));
    substitutedText = substitutedText.replace(/\{\{\$timestamp\}\}/g, String(Date.now()));
    substitutedText = substitutedText.replace(/\{\{\$guid\}\}/g, () =>
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      })
    );

    return substitutedText;
  };

  const handleSend = async () => {
    setLoading(true);
    setStatusCode(null);
    setResponse(null);

    try {
      // Fetch the latest variables right before sending the request
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        throw new Error("User ID not found");
      }
      
      let currentVariables: WorkspaceVariable[] = [];
      const response = await ApiService.get(`/variables?userId=${userId}`);
      if (response.ok) {
          currentVariables = response.data?.variables || [];
      } else {
          console.error('Failed to fetch variables:', response);
      }

      const substitutedUrl = substituteVariables(url, currentVariables);
      const substitutedBody = substituteVariables(body, currentVariables);

      const res = await fetch(substitutedUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method !== "GET" && method !== "DELETE" ? substitutedBody : undefined,
      });

      setStatusCode(res.status);
      const text = await res.text();
      setResponse(text);
    } catch (error: any) {
      setResponse("❌ Error: " + error.message);
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
    
    onSave({
      name: requestName,
      method,
      url,
      body: body.trim() || undefined,
      savedRequestId,
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
          <VariableInput
            ref={inputRef}
            placeholder="Enter request URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-[#1a1b20] text-white border-[#2e2f3e]"
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
