"use client";

import { DragEvent, useState } from "react";
import {
  Type,
  Image,
  Video,
  Sparkles,
  Crop,
  Film,
  LayoutGrid,
  Plus,
  LogOut,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

const nodeTypes = [
  { name: "Text Node", icon: Type },
  { name: "Upload Image", icon: Image },
  { name: "Upload Video", icon: Video },
  { name: "Run LLM", icon: Sparkles },
  { name: "Crop Image", icon: Crop },
  { name: "Extract Frame", icon: Film },
];

export function LeftSidebar() {
  const [workflowTitle, setWorkflowTitle] = useState("My First Galaxy");

  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className="flex h-full border-r border-gray-800"
      style={{ backgroundColor: "rgb(33, 33, 38)" }}
    >
      {/* Main Panel */}
      <div className="flex flex-col" style={{ width: "239.2px" }}>
        {/* Workflow Title Header */}
        <div className="pt-8 px-5 pb-4 flex items-start justify-between gap-2">
          <div className="flex-1">
            <input
              value={workflowTitle}
              onChange={(e) => setWorkflowTitle(e.target.value)}
              className="bg-transparent text-gray-200 font-medium text-sm w-full outline-none focus:border-b focus:border-gray-600 transition-colors pb-1"
              placeholder="Workflow Name"
            />
          </div>
          <div className="flex items-center">
            <SignOutButton>
              <button className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800/50">
                <LogOut className="w-4 h-4" />
              </button>
            </SignOutButton>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-5">
          <p className="text-gray-400 text-xs font-medium mb-3 mt-2">
            Quick access
          </p>

          {/* Node Grid */}
          <div className="grid grid-cols-2 gap-2">
            {nodeTypes.map((node) => (
              <div
                key={node.name}
                draggable
                onDragStart={(e) => onDragStart(e, node.name)}
                className="flex flex-col items-center justify-center gap-2 p-2 border border-gray-700/50 hover:border-gray-500 hover:bg-[#2a2a2d] cursor-move transition-all group rounded-md"
                style={{ height: "90px" }}
              >
                <node.icon className="w-5 h-5 text-gray-400 group-hover:text-gray-200 transition-colors" />
                <span className="text-gray-400 group-hover:text-gray-200 text-[10px] font-medium text-center leading-tight transition-colors">
                  {node.name}
                </span>
              </div>
            ))}

            {/* Extra placeholder items */}
            <div
              className="flex flex-col items-center justify-center gap-2 p-2 border border-gray-700/50 hover:border-gray-500 hover:bg-[#2a2a2d] cursor-pointer transition-all group rounded-md"
              style={{ height: "90px" }}
            >
              <Plus className="w-5 h-5 text-gray-400 group-hover:text-gray-200 transition-colors" />
              <span className="text-gray-400 group-hover:text-gray-200 text-[10px] font-medium text-center leading-tight transition-colors">
                Import Model
              </span>
            </div>
            <div
              className="flex flex-col items-center justify-center gap-2 p-2 border border-gray-700/50 hover:border-gray-500 hover:bg-[#2a2a2d] cursor-pointer transition-all group rounded-md"
              style={{ height: "90px" }}
            >
              <LayoutGrid className="w-5 h-5 text-gray-400 group-hover:text-gray-200 transition-colors" />
              <span className="text-gray-400 group-hover:text-gray-200 text-[10px] font-medium text-center leading-tight transition-colors">
                Browse All
              </span>
            </div>
          </div>
        </div>

        {/* Footer / Toolbox section */}
        <div className="mt-auto px-5 py-6 border-t border-gray-800/30">
          <h2 className="text-gray-200 font-medium mb-3 text-sm">Toolbox</h2>
          <p className="text-gray-500 text-xs">Editing</p>
        </div>
      </div>
    </div>
  );
}
