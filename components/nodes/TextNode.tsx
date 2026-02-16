"use client";

import { memo, useEffect, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { useWorkflowStore, type HandleInfo } from "@/lib/store";
import { NodeMenu } from "./NodeMenu";

export const TextNode = memo(({ id, data }: NodeProps) => {
  const text = useWorkflowStore((state) => state.nodeData[id]?.text || "");
  const isLocked = useWorkflowStore(
    (state) => state.nodes.find((n) => n.id === id)?.data?.isLocked || false,
  );
  const label = useWorkflowStore(
    (state) => state.nodes.find((n) => n.id === id)?.data?.label || "Text",
  );

  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const registerNodeHandles = useWorkflowStore(
    (state) => state.registerNodeHandles,
  );
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const duplicateNode = useWorkflowStore((state) => state.duplicateNode);
  const renameNode = useWorkflowStore((state) => state.renameNode);
  const setNodeLock = useWorkflowStore((state) => state.setNodeLock);

  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [tempName, setTempName] = useState(label);

  // Register handles
  useEffect(() => {
    const inputs: HandleInfo[] = [
      { id: "input", type: "text", label: "Text Input" },
    ];
    const outputs: HandleInfo[] = [
      { id: "output", type: "text", label: "Text Output" },
    ];
    registerNodeHandles(id, inputs, outputs);
  }, [id, registerNodeHandles]);

  const handleRename = () => {
    setShowRenameDialog(true);
    setTempName(label);
  };

  const confirmRename = () => {
    renameNode(id, tempName);
    setShowRenameDialog(false);
  };

  return (
    <>
      <div className="bg-[#1e1e1e] rounded-xl border border-gray-700 shadow-2xl min-w-[280px] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
            <div className="text-sm  text-gray-200">{label}</div>
            {isLocked && <span className="text-xs text-yellow-500">🔒</span>}
          </div>
          <NodeMenu
            onDuplicate={() => duplicateNode(id)}
            onRename={handleRename}
            onLock={() => setNodeLock(id, !isLocked)}
            onDelete={() => deleteNode(id)}
            isLocked={isLocked}
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <textarea
            className="nodrag w-full px-3 py-2 text-sm bg-[#2a2a2a] border border-gray-600 rounded-lg text-gray-200 placeholder:text-gray-500 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 resize-none transition-colors font-dm-sans"
            placeholder="Enter text..."
            rows={4}
            value={text}
            onChange={(e) =>
              updateNodeData(id, {
                text: e.target.value,
                output: e.target.value,
              })
            }
          />
        </div>

        {/* Handles */}
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className="w-3 h-3 !bg-gray-500 !border-2 !border-[#1e1e1e]"
          style={{ left: -6 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="w-3 h-3 !bg-gray-500 !border-2 !border-[#1e1e1e]"
          style={{ right: -6 }}
        />
      </div>

      {/* Rename Dialog */}
      {showRenameDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-[#1e1e1e] border border-gray-700 rounded-lg p-6 w-80">
            <h3 className="text-lg font-medium text-gray-200 mb-4 font-dm-sans">
              Rename Node
            </h3>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-gray-200 outline-none focus:border-gray-500 mb-4 font-dm-sans"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={confirmRename}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors font-dm-sans"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowRenameDialog(false)}
                className="flex-1 px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 rounded-lg transition-colors font-dm-sans"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

TextNode.displayName = "TextNode";
