"use client";

import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  ChangeEvent,
  RefObject,
  useCallback,
  useImperativeHandle,
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
import { EditableDiv } from "./EditableDiv";

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
  onChange: (e: ChangeEvent<HTMLInputElement> | { target: { value: string } }) => void; // Allow for custom event
  placeholder?: string;
  className?: string;
};

export const VariableInput = forwardRef<HTMLDivElement, VariableInputProps>(
  ({ value, onChange, placeholder, className }, ref) => {
    const localRef = useRef<HTMLDivElement>(null);
    const inputRef = (ref as RefObject<HTMLDivElement>) || localRef;
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
        
        if (response.ok) {
          const variablesArray = response.data?.variables || [];
          setVariables(variablesArray);
        } else {
          setVariables([]);
        }
      } catch (err) {
        setVariables([]);
        setError('Failed to load variables');
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchVariables();
    }, [fetchVariables]);

    const handleEditableDivChange = (newValue: string) => {
      // Simulate a ChangeEvent to maintain compatibility with RequestBlock
      const event = {
        target: { value: newValue },
      } as ChangeEvent<HTMLInputElement>;
      handleInputChange(event);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement> | {target: { value: string }}) => {
      const newValue = e.target.value;
      onChange(e);

      const match = newValue.match(/\{\{([^}]+)$/);
      if (match) {
        const query = match[1];
        setCurrentQuery(query);

        const dynamicVars: WorkspaceVariable[] = [
          { variable_key: '$randomInt', id: -1, value: '', scope: 'global' as VariableScope, workspace_id: 0 },
          { variable_key: '$timestamp', id: -2, value: '', scope: 'global' as VariableScope, workspace_id: 0 },
          { variable_key: '$guid', id: -3, value: '', scope: 'global' as VariableScope, workspace_id: 0 },
        ];
        
        const allVars = [...variables, ...dynamicVars];

        const filteredVars = allVars.filter((v) =>
          v.variable_key.toLowerCase().includes(query.toLowerCase())
        );
        
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

    const insertVariable = (variableKey: string) => {
      const el = inputRef.current;
      if (!el) return;

      setShowSuggestions(false);
      setFiltered([]);

      const lastOpenBraceIndex = value.lastIndexOf("{{");
      if (lastOpenBraceIndex === -1) return;
      
      const newValue = value.slice(0, lastOpenBraceIndex) + 
        `{{${variableKey}}}`

      const event = {
        target: { value: newValue },
      } as ChangeEvent<HTMLInputElement>;
      
      onChange(event);

      requestAnimationFrame(() => {
        el.focus();
        // Move cursor to the end
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false); // false for end
        sel?.removeAllRanges();
        sel?.addRange(range);
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
          setNewVariable({
            key: '',
            value: '',
            scope: 'workspace',
            workspace_id: 1
          });
          insertVariable(newVariable.key);
          await fetchVariables();
        } else {
          setError(response.error || 'Failed to create variable');
        }
      } catch (err) {
        setError('An error occurred while creating the variable');
      } finally {
        setIsCreating(false);
      }
    };

    return (
      <div className="relative w-full">
        <EditableDiv
          ref={inputRef}
          value={value}
          onChange={handleEditableDivChange}
          onKeyDown={() => {}}
          placeholder={placeholder}
          className={cn(
            "rounded-md bg-[#1a1b20] text-white border border-[#2e2f3e] px-4 py-2 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500",
            className,
            "empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
          )}
        />
        {showSuggestions && (
          <div className="absolute z-10 w-full mt-1 bg-[#1a1b20] border border-[#2e2f3e] rounded-md shadow-lg">
            {isLoading ? (
              <div className="p-2 text-white">Loading...</div>
            ) : filtered.length > 0 ? (
              filtered.map((v) => (
                <div
                  key={v.id}
                  className="p-2 text-white cursor-pointer hover:bg-[#2e2f3e]"
                  onClick={() => handleSuggestionClick(v)}
                >
                  {v.variable_key}
                </div>
              ))
            ) : (
              <div className="p-2 text-white">
                No results.{" "}
                <Button
                  variant="link"
                  className="p-0 text-blue-400"
                  onClick={() => setShowCreateDialog(true)}
                >
                  Create new variable?
                </Button>
              </div>
            )}
          </div>
        )}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-[#1a1b20] text-white border-[#2e2f3e]">
            <DialogHeader>
              <DialogTitle>Create New Variable</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Variable Name"
                value={newVariable.key}
                onChange={(e) => setNewVariable({ ...newVariable, key: e.target.value })}
                className="bg-[#2e2f3e] border-none"
              />
              <Input
                placeholder="Variable Value"
                value={newVariable.value}
                onChange={(e) => setNewVariable({ ...newVariable, value: e.target.value })}
                className="bg-[#2e2f3e] border-none"
              />
              <Select
                value={newVariable.scope}
                onValueChange={(scope: VariableScope) => setNewVariable({ ...newVariable, scope })}
              >
                <SelectTrigger className="bg-[#2e2f3e] border-none">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1b20] text-white border-[#2e2f3e]">
                  <SelectItem value="workspace">Workspace</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <DialogFooter>
               <Button variant="ghost" onClick={() => setShowCreateDialog(false)} className="hover:bg-[#2e2f3e]">Cancel</Button>
              <Button onClick={handleCreateVariable} disabled={isCreating} className="bg-blue-600 hover:bg-blue-700">
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

VariableInput.displayName = "VariableInput";
