"use client";

import { Keyboard, Plus, FolderSearch } from "lucide-react";

export const EmptyTab = () => {
  const cards = [
    {
      title: "New Request",
      description: "Command + N to create a new request",
      icon: <Plus className="w-6 h-6 text-purple-400" />,
    },
    {
      title: "New Collection",
      description: "Command + U to create a new collection",
      icon: <FolderSearch className="w-6 h-6 text-green-400" />,
    },
    {
      title: "Quick Search",
      description: "Commandj + K to open search",
      icon: <Keyboard className="w-6 h-6 text-cyan-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 max-w-6xl mx-auto">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-[#1a1b20] border border-[#474855] text-white rounded-2xl p-5 shadow-lg hover:border-purple-500 transition-all duration-300 flex items-start gap-4"
        >
          <div className="p-2 bg-[#2e2f3e] rounded-lg">{card.icon}</div>
          <div>
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <p className="text-sm text-[#94a1b2]">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
