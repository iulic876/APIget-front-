"use client";
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (requests: any[]) => void;
}

export const ImportModal = ({ open, onClose, onSubmit }: ImportModalProps) => {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      // We can add more validation here if needed
      if (Array.isArray(parsedJson)) {
        onSubmit(parsedJson);
        onClose();
      } else if (parsedJson.requests && Array.isArray(parsedJson.requests)) {
        // Handle postman collection format
        onSubmit(parsedJson.requests)
      } else {
        setError("Invalid format. Please provide a JSON array of requests.");
      }
    } catch (e) {
      setError("Invalid JSON format.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1b20] text-white border-[#2e2f3e]">
        <DialogHeader>
          <DialogTitle>Import Collection</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-2">Paste your collection JSON here:</p>
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full bg-[#2e2f3e] border-none min-h-[200px]"
            placeholder='[{"method": "GET", "url": "/api/users"}, ...]'
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="hover:bg-[#2e2f3e]">Cancel</Button>
          <Button onClick={handleImport} className="bg-blue-600 hover:bg-blue-700">
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
