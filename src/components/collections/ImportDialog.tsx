"use client";

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
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    requests: {
      id: string;
      method: string;
      path: string;
      summary: string;
      tag: string;
    }[]
  ) => void;
}
const handleImport = ({ name, json }: { name: string; json: string }) => {
  try {
    const parsed = JSON.parse(json);

    const endpoints = Object.entries(parsed.paths || {}).flatMap(
      ([path, methods]) =>
        Object.entries(methods as any).map(([method, details]: any) => ({
          method: method.toUpperCase(),
          path,
          summary: details.summary || "",
          tag: details.tags?.[0] || "Untagged",
        }))
    );

    console.log("📦 Imported Collection Name:", name);
    console.log("🔍 Extracted Endpoints:", endpoints);
  } catch (err) {
    console.error("❌ Invalid JSON:", err);
  }
};


function parseOpenApiJson(raw: string) {
  try {
    const json = JSON.parse(raw);
    if (!json.paths) return [];

    const results = [];

    for (const path in json.paths) {
      const methods = json.paths[path];
      for (const method in methods) {
        const operation = methods[method];
        results.push({
          id: `${method.toUpperCase()} ${path}`,
          method: method.toUpperCase(),
          path,
          summary: operation.summary || "",
          tag: operation.tags?.[0] || "",
        });
      }
    }

    return results;
  } catch (err) {
    console.error("❌ Invalid OpenAPI JSON:", err);
    return [];
  }
}

export const ImportModal = ({ open, onClose, onSubmit }: ImportModalProps) => {
  const [name, setName] = useState("");
  const [json, setJson] = useState("");

  const handleSubmit = () => {
    const parsed = parseOpenApiJson(json);
    if (parsed.length === 0) {
      alert("Invalid OpenAPI JSON or no endpoints found.");
      return;
    }

    console.log(`✅ Parsed ${parsed.length} endpoints from "${name}"`);
    onSubmit(parsed);

    setName("");
    setJson("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1b20] text-white border border-[#2e2f3e]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Import OpenAPI Collection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm">
              Collection Name
            </Label>
            <Input
              id="name"
              placeholder="My Auth API"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#16181d] text-white border border-[#2e2f3e]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="json" className="text-sm">
              Paste OpenAPI JSON
            </Label>
            <Textarea
              id="json"
              placeholder="{ ... }"
              rows={10}
              value={json}
              onChange={(e) => setJson(e.target.value)}
              className="bg-[#16181d] text-white border border-[#2e2f3e] font-mono text-sm"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-[#94a1b2] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#7f5af0] hover:bg-[#6b4de6] text-white"
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
