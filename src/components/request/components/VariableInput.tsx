"use client";

import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  ChangeEvent,
  RefObject,
  useCallback,
} from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ApiService from "@/services/api";

interface WorkspaceVariable {
  id: number;
  variable_key: string;
  value: string;
  scope: VariableScope;
  workspace_id: number;
  created_at?: string;
  updated_at?: string;
}

type VariableScope = 'global' | 'environment' | 'workspace' | 'local';

interface Variable {
  key: string;
  value: string;
  scope: VariableScope;
  workspace_id: number;
}

type VariableInputProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
};

export const VariableInput = forwardRef<HTMLInputElement, VariableInputProps>(
  ({ value, onChange, placeholder, className }, ref) => {
    const localRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as RefObject<HTMLInputElement>) || localRef;
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [variables, setVariables] = useState<WorkspaceVariable[]>([]);
    const [filtered, setFiltered] = useState<WorkspaceVariable[]>([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newVariable, setNewVariable] = useState<Variable>({
      key: '',
      value: '',
      scope: 'workspace',
      workspace_id: 1
    });
    const [currentQuery, setCurrentQuery] = useState('');

    const fetchVariables = useCallback(async () => {
      try {
        setIsLoading(true);
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          setError('User ID not found');
          return;
        }

        const response = await ApiService.get(`/variables?userId=${parseInt(userId)}`);
        console.log('Raw API response:', response);
        
        if (response.ok) {
          // The response structure is { variables: [...] }
          const variablesArray = response.data?.variables || [];
          console.log('Variables array:', variablesArray);
          setVariables(variablesArray);
        } else {
          console.error('Invalid variables response:', response);
          setVariables([]);
        }
      } catch (err) {
        console.error('Error fetching variables:', err);
        setVariables([]);
        setError('Failed to load variables');
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchVariables();
    }, [fetchVariables]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(e);

      if (newValue.includes("{{")) {
        const match = newValue.match(/\{\{([^}]*)/);
        const query = match ? match[1].toLowerCase() : "";
        setCurrentQuery(query);
        console.log('Current variables state:', variables);
        console.log('Current query:', query);
        
        // Make sure we're working with the array of variables
        const varsArray = Array.isArray(variables) ? variables : [];
        const filteredVars = varsArray.filter((v) => 
          v?.variable_key?.toLowerCase().includes(query)
        );
        
        console.log('Filtered variables:', filteredVars);
        setFiltered(filteredVars);
        setShowSuggestions(true);
        if (query) {
          setNewVariable(prev => ({ ...prev, key: query }));
        }
      } else {
        setShowSuggestions(false);
        setFiltered([]);
        setCurrentQuery('');
      }
    };

    // Debug effect to monitor variables state
    useEffect(() => {
      console.log('Variables state updated:', variables);
    }, [variables]);

    // Debug effect to monitor filtered state
    useEffect(() => {
      console.log('Filtered state updated:', filtered);
    }, [filtered]);

    const insertVariable = (variableKey: string) => {
      const el = inputRef.current;
      if (!el) return;

      setShowSuggestions(false);
      setFiltered([]);

      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const textBeforeCursor = value.slice(0, start);
      const textAfterCursor = value.slice(end);
      
      const lastOpenBraceIndex = textBeforeCursor.lastIndexOf("{{");
      if (lastOpenBraceIndex === -1) return;
      
      const newValue = textBeforeCursor.slice(0, lastOpenBraceIndex) + 
        `{{${variableKey}}}` + 
        textAfterCursor;

      const event = {
        ...new Event("change", { bubbles: true }),
        target: { value: newValue },
      } as unknown as ChangeEvent<HTMLInputElement>;

      onChange(event);

      requestAnimationFrame(() => {
        const newCursorPos = lastOpenBraceIndex + variableKey.length + 4;
        el.focus();
        el.setSelectionRange(newCursorPos, newCursorPos);
      });
    };

    const handleSuggestionClick = (variable: WorkspaceVariable) => {
      setShowSuggestions(false);
      setFiltered([]);
      insertVariable(variable.variable_key);
    };

    const handleCreateVariable = async () => {
      try {
        setIsCreating(true);
        setError(null);

        if (!newVariable.key || !newVariable.value) {
          setError('Key and value are required');
          return;
        }

        const userId = localStorage.getItem('user_id');
        if (!userId) {
          setError('User ID not found');
          return;
        }

        const variableData = {
          key: newVariable.key,
          value: newVariable.value,
          scope: newVariable.scope,
          workspace_id: parseInt(userId)
        };

        const response = await ApiService.post(`/variables?userId=${parseInt(userId)}`, variableData);
        
        if (response.ok && response.data) {
          setShowCreateDialog(false);
          // Reset form
          setNewVariable({
            key: '',
            value: '',
            scope: 'workspace',
            workspace_id: 1
          });
          // Insert the variable
          insertVariable(newVariable.key);
          // Refetch variables to get the updated list
          await fetchVariables();
        } else {
          setError(response.error || 'Failed to create variable');
        }
      } catch (err) {
        console.error('Error creating variable:', err);
        setError('An error occurred while creating the variable');
      } finally {
        setIsCreating(false);
      }
    };

    return (
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            "rounded-md bg-[#1a1b20] text-white border border-[#2e2f3e] px-4 py-2",
            className
          )}
        />
        {showSuggestions && (
          <ul className="absolute left-0 top-full mt-1 z-50 rounded-md bg-[#1a1b20] border border-[#2e2f3e] shadow-lg text-white text-sm max-h-40 overflow-y-auto min-w-[200px]">
            {isLoading && (
              <li className="px-3 py-2 text-center text-gray-400">Loading variables...</li>
            )}
            {error && (
              <li className="px-3 py-2 text-center text-red-400">{error}</li>
            )}
            {!isLoading && !error && filtered.length === 0 && variables.length > 0 && (
              <li className="px-3 py-2 text-center text-gray-400">No matching variables</li>
            )}
            {filtered.map((v) => (
              <li
                key={v.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSuggestionClick(v);
                }}
                className="px-3 py-2 hover:bg-[#2e2f3e] cursor-pointer"
              >
                <div className="border-[0.5] border-violet-300 mx-3 flex justify-center rounded-md bg-violet-500">
                  {v.variable_key}
                </div>
              </li>
            ))}
            <li
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowCreateDialog(true);
                setNewVariable(prev => ({
                  ...prev,
                  key: currentQuery || '',
                  value: ''  // Reset value when opening dialog
                }));
              }}
              className={cn(
                "px-3 py-2 hover:bg-[#2e2f3e] cursor-pointer",
                (filtered.length > 0 || isLoading || error) && "border-t border-[#2e2f3e]"
              )}
            >
              <div className="flex items-center justify-center gap-2 text-violet-400">
                <span>+ Create variable "{currentQuery || 'new'}"</span>
              </div>
            </li>
          </ul>
        )}

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-[#1a1b20] text-white border-[#2e2f3e]" showCloseButton>
            <DialogHeader>
              <DialogTitle>Create New Variable</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <div className="text-red-400 text-sm p-2 bg-red-400/10 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm">Variable Name</label>
                <Input
                  value={newVariable.key}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, key: e.target.value }))}
                  className="bg-[#2e2f3e] border-[#3e3f4e]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Value</label>
                <Input
                  value={newVariable.value}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, value: e.target.value }))}
                  className="bg-[#2e2f3e] border-[#3e3f4e]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Scope</label>
                <Select
                  value={newVariable.scope}
                  onValueChange={(value: VariableScope) => 
                    setNewVariable(prev => ({ ...prev, scope: value }))
                  }
                >
                  <SelectTrigger className="bg-[#2e2f3e] border-[#3e3f4e] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1b20] border-[#2e2f3e]">
                    <SelectItem value="global" className="text-white hover:bg-[#2e2f3e]">Global</SelectItem>
                    <SelectItem value="workspace" className="text-white hover:bg-[#2e2f3e]">Workspace</SelectItem>
                    <SelectItem value="environment" className="text-white hover:bg-[#2e2f3e]">Environment</SelectItem>
                    <SelectItem value="local" className="text-white hover:bg-[#2e2f3e]">Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setShowCreateDialog(false)}
                className="hover:bg-[#2e2f3e]"
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateVariable}
                className="bg-violet-600 hover:bg-violet-700"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Variable'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

VariableInput.displayName = "VariableInput";
