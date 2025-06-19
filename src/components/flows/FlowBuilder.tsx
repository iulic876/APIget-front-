"use client";

import { useState } from "react";
import { Plus, Zap, Timer, GitBranch } from "lucide-react";
import clsx from "clsx";

type StepType = "request" | "delay" | "condition";

type Step = {
  id: string;
  type: StepType;
};

const generateId = () => Math.random().toString(36).substring(2, 9);

export const FlowBuilder = () => {
  const [steps, setSteps] = useState<Step[]>([]);

  const addStep = (type: StepType) => {
    setSteps((prev) => [...prev, { id: generateId(), type }]);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-white text-xl font-semibold mb-4">Flow Builder</h2>

      {/* Add Step Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => addStep("request")}
          className="flex items-center gap-2 text-white bg-[#21262d] px-4 py-2 rounded-md hover:bg-[#2a2f38]"
        >
          <Zap size={16} /> Add Request
        </button>
        <button
          onClick={() => addStep("delay")}
          className="flex items-center gap-2 text-white bg-[#21262d] px-4 py-2 rounded-md hover:bg-[#2a2f38]"
        >
          <Timer size={16} /> Add Delay
        </button>
        <button
          onClick={() => addStep("condition")}
          className="flex items-center gap-2 text-white bg-[#21262d] px-4 py-2 rounded-md hover:bg-[#2a2f38]"
        >
          <GitBranch size={16} /> Add Condition
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={clsx(
              "rounded-lg p-4 shadow-md",
              step.type === "request" && "bg-[#1f2937]",
              step.type === "delay" && "bg-[#374151]",
              step.type === "condition" && "bg-[#4b5563]"
            )}
          >
            <h3 className="text-white font-medium mb-2 capitalize">
              {step.type}
            </h3>
            {step.type === "request" && (
              <input
                type="text"
                placeholder="GET /endpoint"
                className="w-full p-2 rounded bg-[#111827] text-white placeholder:text-gray-500"
              />
            )}
            {step.type === "delay" && (
              <input
                type="number"
                placeholder="1000 ms"
                className="w-full p-2 rounded bg-[#111827] text-white placeholder:text-gray-500"
              />
            )}
            {step.type === "condition" && (
              <input
                type="text"
                placeholder="x > 10 ?"
                className="w-full p-2 rounded bg-[#111827] text-white placeholder:text-gray-500"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
