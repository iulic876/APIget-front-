"use client";

import * as React from "react";
import { Check, ChevronsUpDown, UsersRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function TeamSwitcher({
  teams,
  defaultTeam,
}: {
  teams: string[];
  defaultTeam: string;
}) {
  const [selectedTeam, setSelectedTeam] = React.useState(defaultTeam);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2 bg-[#1a1b20] text-white border border-[#2e2f3e]"
        >
          <UsersRound className="mr-2 h-4 w-4" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{selectedTeam}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 text-[#94a1b2]" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-[200px] bg-[#1a1b20] border border-[#2e2f3e] text-white"
      >
        {teams.map((team) => (
          <DropdownMenuItem
            key={team}
            onSelect={() => setSelectedTeam(team)}
            className="flex justify-between items-center"
          >
            <span>{team}</span>
            {team === selectedTeam && (
              <Check className="h-4 w-4 text-[#2cb67d]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
