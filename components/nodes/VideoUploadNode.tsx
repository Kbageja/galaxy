"use client";

import { memo, useEffect, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Upload, X } from "lucide-react";
import { useWorkflowStore, type HandleInfo } from "@/lib/store";
import { NodeMenu } from "./NodeMenu";

export const VideoUploadNode = memo(({ id, data }: NodeProps) => {
  const videoUrl = useWorkflowStore(
    (state) => state.nodeData[id]?.videoUrl || null,
  );
  const isLocked = useWorkflowStore(
    (state) => state.nodes.find((n) => n.id === id)?.data?.isLocked || false,
  );
  const label = useWorkflowStore(
    (state) =>
      state.nodes.find((n) => n.id === id)?.data?.label || "Upload Video",
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
    const outputs: HandleInfo[] = [
      { id: "output", type: "video", label: "Video Output" },
    ];
    registerNodeHandles(id, [], outputs);
  }, [id, registerNodeHandles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      updateNodeData(id, { videoUrl: url, output: url });
    }
  };

  const handleClear = () => {
    updateNodeData(id, { videoUrl: null, output: null });
  };

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
            <div className="text-sm text-gray-200">{label}</div>
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
        <div className="p-4 flex flex-col items-center">
          {!videoUrl ? (
            <label
              className="nodrag flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors"
              style={{
                width: "274.04px",
                height: "274.04px",
                backgroundImage: `
                  linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
                  linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
                  linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)
                `,
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                backgroundColor: "#1a1a1a",
              }}
            >
              <Upload className="w-8 h-8 text-gray-500 mb-2" />
              <span className="text-sm text-gray-400">Click to upload</span>
              <input
                type="file"
                className="hidden"
                accept="video/*"
                onChange={handleFileSelect}
              />
            </label>
          ) : (
            <div
              className="relative"
              style={{ width: "274.04px", height: "274.04px" }}
            >
              <video
                src={videoUrl}
                className="w-full h-full object-cover rounded-lg"
                controls={false}
                autoPlay
                muted
                loop
                playsInline
              />
              <button
                onClick={handleClear}
                className="nodrag absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Output Handle */}
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="w-3 h-3 !bg-gray-500 !border-2 !border-gray-800"
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

VideoUploadNode.displayName = "VideoUploadNode";
