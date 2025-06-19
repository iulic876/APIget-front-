"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

export function MethodSelector({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        className={cn(
          "inline-flex items-center justify-between rounded-md px-4 py-2 bg-[#21262d] text-white text-sm focus:outline-none",
          className
        )}
      >
        <Select.Value />
        <Select.Icon>
          <ChevronDown className="h-4 w-4 text-[#94a1b2]" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="z-50 overflow-hidden rounded-md bg-[#16181d] border border-[#2e2f3e] text-white shadow-xl">
          <Select.Viewport className="p-1">
            {METHODS.map((method) => (
              <Select.Item
                key={method}
                value={method}
                className="relative flex items-center px-3 py-2 rounded-sm text-sm hover:bg-[#2a2f38] focus:bg-[#2a2f38] outline-none cursor-pointer"
              >
                <Select.ItemText>{method}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-2">
                  <Check className="h-4 w-4 text-[#7f5af0]" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
