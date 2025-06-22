'use client'

import { Book, Bot, Database } from "lucide-react";
import { useState } from "react";
import { ClientOnly } from "../ClientOnly";

const UserModelLayoutContent = () => {
    // Basic state and handlers can be added here later
    const [open, setOpen] = useState(false);

    return (
        <div className="bg-[#272c34]">
            <aside className="w-[260px] text-white p-4 space-y-4 bg-[#161b22] rounded-tl-2xl h-full overflow-y-auto">
                <h2 className="text-lg font-semibold mb-2">User Model</h2>

                <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2 text-sm text-white font-medium mb-2">
                        <Bot size={16} />
                        Models
                    </div>
                    {/* Placeholder for future model items */}
                    <div className="w-full mt-4">
                        <h3 className="text-md font-semibold mb-2">Your Models</h3>
                        <div className="space-y-1">
                            {/* Example model */}
                            <div className="flex items-center justify-between p-2 rounded-md bg-[#2a2f38] hover:bg-[#3a3f48] cursor-pointer group">
                                <div className="flex items-center gap-2">
                                    <Database size={16} />
                                    <span className="text-sm truncate">User</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-md bg-[#2a2f38] hover:bg-[#3a3f48] cursor-pointer group">
                                <div className="flex items-center gap-2">
                                    <Database size={16} />
                                    <span className="text-sm truncate">Product</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export const UserModelLayout = () => {
    return (
        <ClientOnly>
            <UserModelLayoutContent />
        </ClientOnly>
    );
}; 