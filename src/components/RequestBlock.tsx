// components/RequestBlock.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "./ui/input";
import { useSavedRequests, SavedRequest } from "./context/SavedRequestsContext";
import { MethodSelector } from "./collections/MethodSelector";
import { VariableInput } from "./request/components/VariableInput";
import ApiService from "@/services/api";
import { toast } from "sonner";
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [preRequestScript, setPreRequestScript] = useState("");
  const [postRequestScript, setPostRequestScript] = useState("");
  const [response, setResponse] = useState<null | string>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState(requestLabel);
  const [isDirty, setIsDirty] = useState(false);
  const { getRequestById, updateRequest: updateRequestInContext } = useSavedRequests();
  const inputRef = useRef<HTMLInputElement>(null);
  const preScriptTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const postScriptTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initialRequestState = useRef<Partial<SavedRequest>>({});

  // Script execution environment
  const scriptEnvironment = {
    variables: new Map<string, any>(),
    request: {
      method: method,
      url: url,
      headers: new Map<string, string>(),
      body: body,
      addHeader: function(key: string, value: string) {
        this.headers.set(key, value);
      }
    },
    response: null as any,
    test: {
      assertions: [] as Array<{name: string, passed: boolean, error?: string}>,
      expect: function(value: any) {
        return {
          to: {
            have: {
              status: function(expectedStatus: number) {
                const actualStatus = scriptEnvironment.response?.status;
                const passed = actualStatus === expectedStatus;
                scriptEnvironment.test.assertions.push({
                  name: `Status code is ${expectedStatus}`,
                  passed,
                  error: passed ? undefined : `Expected ${expectedStatus}, got ${actualStatus}`
                });
                return this;
              }
            }
          }
        };
      }
    },
    environment: {
      get: function(key: string) {
        return scriptEnvironment.variables.get(key);
      },
      set: function(key: string, value: any) {
        scriptEnvironment.variables.set(key, value);
      }
    },
    console: {
      log: function(...args: any[]) {
        console.log('[Script]', ...args);
      }
    }
  };

  // Execute pre-request script
  const executePreRequestScript = () => {
    if (!preRequestScript.trim()) return;
    
    try {
      scriptEnvironment.request.method = method;
      scriptEnvironment.request.url = url;
      scriptEnvironment.request.body = body;
      
      const scriptFunction = new Function(
        'pm', 'console', 'Date', 'Math', 'JSON',
        preRequestScript
      );
      
      scriptFunction(
        scriptEnvironment,
        scriptEnvironment.console,
        Date,
        Math,
        JSON
      );
      
      console.log('Pre-request script executed successfully');
    } catch (error) {
      console.error('Pre-request script error:', error);
      toast.error(`Pre-request script error: ${error}`);
    }
  };

  // Execute post-request script
  const executePostRequestScript = (responseData: any, statusCode: number) => {
    if (!postRequestScript.trim()) return;
    
    try {
      scriptEnvironment.response = {
        status: statusCode,
        data: responseData,
        json: function() {
          return this.data;
        }
      };
      
      const scriptFunction = new Function(
        'pm', 'console', 'Date', 'Math', 'JSON',
        postRequestScript
      );
      
      scriptFunction(
        scriptEnvironment,
        scriptEnvironment.console,
        Date,
        Math,
        JSON
      );
      
      if (scriptEnvironment.test.assertions.length > 0) {
        console.log('Test Results:');
        scriptEnvironment.test.assertions.forEach(assertion => {
          if (assertion.passed) {
            console.log(`✅ ${assertion.name}`);
          } else {
            console.log(`❌ ${assertion.name}: ${assertion.error}`);
          }
        });
      }
    } catch (error) {
      console.error('Post-request script error:', error);
      toast.error(`Post-request script error: ${error}`);
    }
  };

  // Update scripts on backend
  const updateScriptsOnBackend = async (preScript: string, postScript: string) => {
    if (!savedRequestId) return;
    
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      console.error("User ID not found");
      return;
    }

    try {
      const response = await ApiService.post(`/requests/scripts`, {
        requestId: savedRequestId,
        preRequestScript: preScript,
        postRequestScript: postScript
      });

      if (response.ok) {
        console.log('Scripts updated successfully');
        toast.success('Scripts saved successfully');
      } else {
        console.error('Failed to update scripts:', response.error);
        toast.error('Failed to save scripts');
      }
    } catch (error) {
      console.error('Error updating scripts:', error);
      toast.error('Error saving scripts');
    }
  };

  // Handle script changes with debouncing
  const handlePreRequestScriptChange = (value: string) => {
    setPreRequestScript(value);
    // Debounce the backend update
    if (preScriptTimeoutRef.current) {
      clearTimeout(preScriptTimeoutRef.current);
    }
    preScriptTimeoutRef.current = setTimeout(() => {
      updateScriptsOnBackend(value, postRequestScript);
    }, 1000);
  };

  const handlePostRequestScriptChange = (value: string) => {
    setPostRequestScript(value);
    // Debounce the backend update
    if (postScriptTimeoutRef.current) {
      clearTimeout(postScriptTimeoutRef.current);
    }
    postScriptTimeoutRef.current = setTimeout(() => {
      updateScriptsOnBackend(preRequestScript, value);
    }, 1000);
  };

  useEffect(() => {
    if (savedRequestId) {
      const savedRequest = getRequestById(savedRequestId);
      if (savedRequest) {
        const fullRequest = {
          ...savedRequest,
          preRequestScript: savedRequest.preRequestScript || "",
          postRequestScript: savedRequest.postRequestScript || "",
        };

        setMethod(fullRequest.method);
        setUrl(fullRequest.url);
        setPreRequestScript(fullRequest.preRequestScript);
        setPostRequestScript(fullRequest.postRequestScript);
        
        const bodyContent = fullRequest.body;
        if (bodyContent) {
          if (typeof bodyContent === 'string') {
            try {
              // It's a string; parse and re-stringify to format it properly.
              const parsedJson = JSON.parse(bodyContent);
              setBody(JSON.stringify(parsedJson, null, 2));
            } catch (e) {
              // It's not a valid JSON string, so use it as is.
              setBody(bodyContent);
            }
          } else {
            // It's an object, so stringify it for the editor.
            setBody(JSON.stringify(bodyContent, null, 2));
          }
        } else {
          setBody("");
        }
        setLabel(fullRequest.name);
        updateTabRequestLabel(tabId, fullRequest.name);

        initialRequestState.current = {
          name: fullRequest.name,
          method: fullRequest.method,
          url: fullRequest.url,
          body: bodyContent,
          preRequestScript: fullRequest.preRequestScript,
          postRequestScript: fullRequest.postRequestScript,
        };
        setIsDirty(false); // Reset dirty state on load
      }
    }
  }, [savedRequestId, getRequestById, updateTabRequestLabel, tabId]);

  // Detect changes to mark request as dirty
  useEffect(() => {
    if (!savedRequestId) return; // Only for saved requests

    const currentState = {
      name: label,
      method,
      url,
      body,
      preRequestScript,
      postRequestScript,
    };

    const initial = initialRequestState.current;
    
    // Normalize body for comparison
    const normalizedCurrentBody = (() => {
      try { return JSON.stringify(JSON.parse(currentState.body || '{}'), null, 2); }
      catch { return currentState.body; }
    })();

    const normalizedInitialBody = (() => {
      if (!initial.body) return "{}";
      if (typeof initial.body === 'string') {
        try { return JSON.stringify(JSON.parse(initial.body), null, 2); } 
        catch { return initial.body; }
      }
      return JSON.stringify(initial.body, null, 2);
    })();
    
    if (
      currentState.name !== initial.name ||
      currentState.method !== initial.method ||
      currentState.url !== initial.url ||
      normalizedCurrentBody !== normalizedInitialBody ||
      currentState.preRequestScript !== initial.preRequestScript ||
      currentState.postRequestScript !== initial.postRequestScript
    ) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [label, method, url, body, preRequestScript, postRequestScript, savedRequestId]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (preScriptTimeoutRef.current) {
        clearTimeout(preScriptTimeoutRef.current);
      }
      if (postScriptTimeoutRef.current) {
        clearTimeout(postScriptTimeoutRef.current);
      }
    };
  }, []);
  
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
      // Execute pre-request script
      executePreRequestScript();

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
      let parsedBody = null;
      if (body.trim()) {
        try {
          parsedBody = JSON.parse(body);
        } catch (error) {
          toast.error("Invalid JSON body.");
          return;
        }
      }

      const substitutedBody = substituteVariables(body, currentVariables);

      const res = await fetch(substitutedUrl, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: method !== "GET" && method !== "DELETE" ? substitutedBody : undefined,
      });

      setStatusCode(res.status);
      const text = await res.text();
      setResponse(text);

      // Execute post-request script
      let responseData = null;
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text;
      }
      executePostRequestScript(responseData, res.status);

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
      body: body.trim() ? JSON.parse(body) : undefined,
      preRequestScript: preRequestScript.trim() || undefined,
      postRequestScript: postRequestScript.trim() || undefined,
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

  const handleUpdateRequest = async () => {
    if (!savedRequestId) return;

    setLoading(true);
    try {
      const payload = {
        name: label,
        method,
        url,
        body: body.trim() ? JSON.parse(body) : undefined,
        pre_request_script: preRequestScript,
        post_request_script: postRequestScript,
      };

      const response = await ApiService.put(`/requests/${savedRequestId}`, payload);

      if (response.ok) {
        toast.success("Request updated successfully!");
        
        // Update context and reset dirty state
        const updatedRequest = { ...payload, id: savedRequestId, preRequestScript, postRequestScript, createdAt: new Date().toISOString() };
        updateRequestInContext(savedRequestId, updatedRequest);
        initialRequestState.current = {
            name: payload.name,
            method: payload.method,
            url: payload.url,
            body: payload.body,
            preRequestScript: payload.pre_request_script,
            postRequestScript: payload.post_request_script,
        };
        setIsDirty(false);
      } else {
        toast.error(response.error || "Failed to update request.");
      }
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("An error occurred while updating the request.");
    } finally {
      setLoading(false);
    }
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
            onClick={savedRequestId && isDirty ? handleUpdateRequest : handleSaveRequest}
          >
            {savedRequestId && isDirty ? 'Save Changes' : 'Save Request'}
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

      <Tabs defaultValue="body" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="response">Response</TabsTrigger>
          <TabsTrigger value="scripts">Scripts</TabsTrigger>
        </TabsList>
        <TabsContent value="body">
          <div className="mt-4">
            <CodeMirror
              value={body}
              height="200px"
              extensions={[json()]}
              onChange={(value) => setBody(value)}
              theme={dracula}
              className="border border-[#2e2f3e] rounded-md"
            />
          </div>
        </TabsContent>
        <TabsContent value="scripts">
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold">Request Scripts</h3>
             
            </div>
            <Tabs defaultValue="pre-request" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pre-request">Pre-request</TabsTrigger>
                <TabsTrigger value="post-request">Post-request</TabsTrigger>
              </TabsList>
              <TabsContent value="pre-request">
                <CodeMirror
                  value={preRequestScript}
                  height="200px"
                  extensions={[javascript()]}
                  onChange={handlePreRequestScriptChange}
                  theme={dracula}
                  className="border border-[#2e2f3e] rounded-md"
                />
              </TabsContent>
              <TabsContent value="post-request">
                <CodeMirror
                  value={postRequestScript}
                  height="200px"
                  extensions={[javascript()]}
                  onChange={handlePostRequestScriptChange}
                  theme={dracula}
                  className="border border-[#2e2f3e] rounded-md"
                />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
        <TabsContent value="response">
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
              
              {/* Test Results */}
              {scriptEnvironment.test.assertions.length > 0 && (
                <div className="mb-4 p-3 bg-[#1a1d23] rounded-md">
                  <h4 className="text-sm font-semibold mb-2">Test Results:</h4>
                  <div className="space-y-1">
                    {scriptEnvironment.test.assertions.map((assertion, index) => (
                      <div key={index} className={`text-sm ${assertion.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {assertion.passed ? '✅' : '❌'} {assertion.name}
                        {!assertion.passed && assertion.error && (
                          <span className="text-gray-400 ml-2">({assertion.error})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <pre className="bg-[#1a1d23] text-green-400 text-sm p-3 rounded-md whitespace-pre-wrap">
                {response}
              </pre>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
