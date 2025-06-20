"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Collection {
  id: number;
  name: string;
}

interface SaveRequestDialogProps {
  open: boolean;
  onClose: () => void;
  collections: Collection[];
  onSave: (collectionId: number) => void;
}

export const SaveRequestDialog = ({ open, onClose, collections, onSave }: SaveRequestDialogProps) => {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const handleSave = () => {
    if (selectedCollection) {
      onSave(parseInt(selectedCollection, 10));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1b20] text-white border-[#2e2f3e]">
        <DialogHeader>
          <DialogTitle>Save Request</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-2">Select a collection to save the request in:</p>
          <Select onValueChange={setSelectedCollection}>
            <SelectTrigger className="w-full bg-[#2e2f3e] border-none">
              <SelectValue placeholder="Choose a collection..." />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1b20] text-white border-[#2e2f3e]">
              {collections.map((collection) => (
                <SelectItem key={collection.id} value={String(collection.id)}>
                  {collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="hover:bg-[#2e2f3e]">Cancel</Button>
          <Button onClick={handleSave} disabled={!selectedCollection} className="bg-blue-600 hover:bg-blue-700">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 