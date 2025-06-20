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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ApiService from "@/services/api";

interface CreateCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  onCollectionCreated: () => void;
}

export const CreateCollectionDialog = ({ open, onClose, onCollectionCreated }: CreateCollectionDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      setError("User not found");
      setIsCreating(false);
      return;
    }

    try {
      const response = await ApiService.post(`/collections?userId=${userId}`, { name, description });
      if (response.ok) {
        onCollectionCreated();
        onClose();
      } else {
        setError(response.error || "Failed to create collection");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1b20] text-white border-[#2e2f3e]">
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Collection Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#2e2f3e] border-none"
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-[#2e2f3e] border-none"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="hover:bg-[#2e2f3e]">Cancel</Button>
          <Button onClick={handleCreate} disabled={isCreating} className="bg-blue-600 hover:bg-blue-700">
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 