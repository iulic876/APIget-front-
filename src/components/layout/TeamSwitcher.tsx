"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ApiService from "@/services/api";

interface Workspace {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
  owner_name: string;
}

export function TeamSwitcher() {
  const [workspace, setWorkspace] = React.useState<Workspace | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = localStorage.getItem('user_id');
        console.log('Current user ID:', userId);
        
        if (!userId) {
          console.error('No user ID found in localStorage');
          setError('No user ID found');
          setLoading(false);
          return;
        }

        const url = `/workspaces/user/${userId}`;
        console.log('Making request to:', url);
        
        const response = await ApiService.get(url);
        console.log('Workspace response:', response);

        if (response.ok && response.data?.workspace) {
          console.log('Setting workspace:', response.data.workspace);
          setWorkspace(response.data.workspace);
        } else {
          const errorMessage = response.error || 'Failed to load workspace';
          console.error('API Error:', errorMessage);
          setError(errorMessage);
        }
      } catch (err) {
        console.error('Error fetching workspace:', err);
        setError('Failed to load workspace');
      } finally {
        setLoading(false);
      }
    };

    const userId = localStorage.getItem('user_id');
    if (userId) {
      console.log('Initiating workspace fetch for user:', userId);
      fetchWorkspace();
    } else {
      console.error('No user ID available in localStorage');
    }
  }, []);

  if (loading) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start px-3 py-2 bg-[#1a1b20] text-white border border-[#2e2f3e]"
        disabled
      >
        <Building2 className="mr-2 h-4 w-4" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">Loading...</span>
        </div>
        <ChevronsUpDown className="ml-auto h-4 w-4 text-[#94a1b2]" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2.5 bg-[#1a1b20] text-white border border-[#2e2f3e] hover:bg-[#1a1b20] hover:text-white"
        >
          <Building2 className="mr-2 h-4 w-4" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">
              {workspace?.name || "No workspace"}
            </span>
            <span className="text-xs text-[#94a1b2]">
              {workspace?.owner_name ||
                localStorage.getItem("user_name") ||
                "User"}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 text-[#94a1b2]" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-[200px] bg-[#1a1b20] border border-[#2e2f3e] text-white"
      >
        {workspace && (
          <DropdownMenuItem className="flex justify-between items-center">
            <div className="flex flex-col">
              <span>{workspace.name}</span>
              <span className="text-xs text-[#94a1b2]">
                {workspace.owner_name}
              </span>
            </div>
            <Check className="h-4 w-4 text-[#2cb67d]" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
