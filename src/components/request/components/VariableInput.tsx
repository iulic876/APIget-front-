"use client";

import {
  forwardRef,
  useRef,
  useState,
  ChangeEvent,
  RefObject,
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

const mockVariables = ["base_url", "token", "user_id", "session_id"];

type VariableScope = 'global' | 'environment' | 'collection' | 'local';

interface NewVariable {
  key: string;
  value: string;
  scope: VariableScope;
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
    const [filtered, setFiltered] = useState<string[]>([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newVariable, setNewVariable] = useState<NewVariable>({
      key: '',
      value: '',
      scope: 'environment'
    });
    const [currentQuery, setCurrentQuery] = useState('');

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(e);

      const lastWord = newValue.split(/\s+/).pop() || "";
      if (lastWord.includes("{{")) {
        const query = lastWord.split("{{")[1].toLowerCase();
        setCurrentQuery(query);
        const filteredVars = mockVariables.filter((v) => 
          v.toLowerCase().includes(query)
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

    const insertVariable = (variable: string) => {
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
        `{{${variable}}}` + 
        textAfterCursor;

      const event = {
        ...new Event("change", { bubbles: true }),
        target: { value: newValue },
      } as unknown as ChangeEvent<HTMLInputElement>;

      onChange(event);

      requestAnimationFrame(() => {
        const newCursorPos = lastOpenBraceIndex + variable.length + 4;
        el.focus();
        el.setSelectionRange(newCursorPos, newCursorPos);
      });
    };

    const handleSuggestionClick = (variable: string) => {
      setShowSuggestions(false);
      setFiltered([]);
      insertVariable(variable);
    };

    const handleCreateVariable = () => {
      // Here you would typically save the variable to your backend/store
      console.log('Creating new variable:', newVariable);
      mockVariables.push(newVariable.key); // Just for demo
      setShowCreateDialog(false);
      insertVariable(newVariable.key);
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
        {showSuggestions && (currentQuery || filtered.length > 0) && (
          <ul className="absolute left-0 top-full mt-1 z-50 rounded-md bg-[#1a1b20] border border-[#2e2f3e] shadow-lg text-white text-sm max-h-40 overflow-y-auto min-w-[200px]">
            {filtered.map((v) => (
              <li
                key={v}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSuggestionClick(v);
                }}
                className="px-3 py-2 hover:bg-[#2e2f3e] cursor-pointer"
              >
                <div className="border-[0.5] border-violet-300 m-1 flex justify-center rounded-md bg-violet-500">
                  {v}
                </div>
              </li>
            ))}
            {currentQuery && !filtered.includes(currentQuery) && (
              <li
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCreateDialog(true);
                }}
                className="px-3 py-2 hover:bg-[#2e2f3e] cursor-pointer border-t border-[#2e2f3e]"
              >
                <div className="flex items-center justify-center gap-2 text-violet-400">
                  <span>+ Create variable "{currentQuery}"</span>
                </div>
              </li>
            )}
          </ul>
        )}

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-[#1a1b20] text-white border-[#2e2f3e]" showCloseButton>
            <DialogHeader>
              <DialogTitle>Create New Variable</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
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
                    <SelectItem value="environment" className="text-white hover:bg-[#2e2f3e]">Environment</SelectItem>
                    <SelectItem value="collection" className="text-white hover:bg-[#2e2f3e]">Collection</SelectItem>
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
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateVariable}
                className="bg-violet-600 hover:bg-violet-700"
              >
                Create Variable
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

VariableInput.displayName = "VariableInput";
