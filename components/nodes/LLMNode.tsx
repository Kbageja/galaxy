"use client";

import { memo, useEffect, useState } from "react";
import {
  Handle,
  Position,
  type NodeProps,
  useUpdateNodeInternals,
} from "reactflow";
import {
  useWorkflowStore,
  type HandleInfo,
  type WorkflowRun,
  type ExecutionLog,
} from "@/lib/store";
import { NodeMenu } from "./NodeMenu";
import { Loader2, Play, Plus } from "lucide-react";

export const LLMNode = memo(({ id, data }: NodeProps) => {
  const updateNodeInternals = useUpdateNodeInternals();
  const nodeData = useWorkflowStore((state) => state.nodeData[id]) || {};
  const isLocked = useWorkflowStore(
    (state) => state.nodes.find((n) => n.id === id)?.data?.isLocked || false,
  );
  const label = useWorkflowStore(
    (state) => state.nodes.find((n) => n.id === id)?.data?.label || "Any LLM",
  );

  const model = nodeData.model || "gemini";
  const systemPromptInput = nodeData.systemPrompt || "";
  const promptInput = nodeData.userMessage || "";
  const output = nodeData.output || "";
  const imageCount = nodeData.imageCount || 1;

  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const registerNodeHandles = useWorkflowStore(
    (state) => state.registerNodeHandles,
  );
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const duplicateNode = useWorkflowStore((state) => state.duplicateNode);
  const renameNode = useWorkflowStore((state) => state.renameNode);
  const setNodeLock = useWorkflowStore((state) => state.setNodeLock);
  const addWorkflowRun = useWorkflowStore((state) => state.addWorkflowRun);
  const getConnectedNodeData = useWorkflowStore(
    (state) => state.getConnectedNodeData,
  );

  const [isRunning, setIsRunning] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [tempName, setTempName] = useState(label);

  const imageUrlToBase64 = async (url: string): Promise<string> => {
    try {
      // 1. Fetch the blob from the URL (works for data: URLs too)
      const response = await fetch(url);
      const blob = await response.blob();

      // 2. Create an Image bitmap to get dimensions
      const imageBitmap = await createImageBitmap(blob);

      // 3. Calculate new dimensions (max 1024x1024)
      let { width, height } = imageBitmap;
      const MAX_SIZE = 1024;

      if (width > MAX_SIZE || height > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // 4. Draw to canvas for resizing and compression
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Could not get canvas context");

      ctx.drawImage(imageBitmap, 0, 0, width, height);

      // 5. Export as compressed JPEG
      // Quality 0.7 is a good balance for LLM vision tasks
      return canvas.toDataURL("image/jpeg", 0.7);
    } catch (error) {
      console.error("Error compressing image:", error);
      // Fallback: return original if possible (though likely to fail size limit if large)
      return url;
    }
  };

  // Register handles dynamically based on imageCount
  useEffect(() => {
    const inputs: HandleInfo[] = [
      { id: "prompt", type: "text", label: "Prompt*" },
      { id: "systemPrompt", type: "text", label: "System Prompt" },
    ];

    for (let i = 1; i <= imageCount; i++) {
      inputs.push({ id: `image_${i}`, type: "image", label: `Image ${i}` });
    }

    const outputs: HandleInfo[] = [
      { id: "output", type: "text", label: "Text" },
    ];
    registerNodeHandles(id, inputs, outputs);

    // Notify React Flow about handle changes
    updateNodeInternals(id);
  }, [id, imageCount, registerNodeHandles, updateNodeInternals]);

  const handleRunModel = async () => {
    if (isRunning) return;
    setIsRunning(true);
    const startTime = Date.now();

    // 1. Collect inputs and create logs for upstream nodes
    const upstreamLogs: ExecutionLog[] = [];
    const images: string[] = [];

    // Helper to log upstream node execution
    const logUpstreamNode = (handleId: string, inputType: "text" | "image") => {
      // Find the edge connected to this handle
      const edges = useWorkflowStore.getState().edges;
      const nodes = useWorkflowStore.getState().nodes;
      const connectedEdge = edges.find(
        (edge) => edge.target === id && edge.targetHandle === handleId,
      );

      if (connectedEdge) {
        const sourceNode = nodes.find((n) => n.id === connectedEdge.source);
        const sourceData = getConnectedNodeData(id, handleId);

        if (sourceNode) {
          upstreamLogs.push({
            id: Math.random().toString(36).substr(2, 9),
            nodeId: sourceNode.id,
            nodeLabel:
              sourceNode.data.label || sourceNode.type || "Unknown Node",
            status: "success",
            duration: 0, // Instant access
            output: sourceData || "(No output)",
          });
        }
        return sourceData;
      }
      return null;
    };

    // Collect Prompts
    const finalSystemPrompt =
      logUpstreamNode("systemPrompt", "text") || systemPromptInput;
    const finalPrompt = logUpstreamNode("prompt", "text") || promptInput;

    // Collect Images
    for (let i = 1; i <= imageCount; i++) {
      const handleId = `image_${i}`;
      const imgData = logUpstreamNode(handleId, "image");

      if (imgData) {
        try {
          const base64 = await imageUrlToBase64(imgData);
          images.push(base64);
        } catch (err) {
          console.error(`Failed to process image from ${handleId}:`, err);
        }
      }
    }

    try {
      const response = await fetch("/api/run-llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          systemPrompt: finalSystemPrompt,
          userMessage: finalPrompt,
          images,
        }),
      });

      const result = await response.json();
      const duration = Date.now() - startTime;

      if (result.success) {
        updateNodeData(id, { output: result.response });

        // Add to history (Upstream logs + Current LLM log)
        const currentLog: ExecutionLog = {
          id: Math.random().toString(36).substr(2, 9),
          nodeId: id,
          nodeLabel: label,
          status: "success",
          duration: parseFloat((duration / 1000).toFixed(1)),
          output: result.response,
        };

        const run: WorkflowRun = {
          id: `run-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          status: "completed",
          logs: [...upstreamLogs, currentLog],
        };
        addWorkflowRun(run);
      } else {
        throw new Error(result.error || "Execution failed");
      }
    } catch (error: any) {
      console.error("LLM Run Error:", error);
      const duration = Date.now() - startTime;

      const currentLog: ExecutionLog = {
        id: Math.random().toString(36).substr(2, 9),
        nodeId: id,
        nodeLabel: label,
        status: "error",
        duration: parseFloat((duration / 1000).toFixed(1)),
        error: error.message,
      };

      const run: WorkflowRun = {
        id: `run-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        status: "failed",
        logs: [...upstreamLogs, currentLog],
      };
      addWorkflowRun(run);
    } finally {
      setIsRunning(false);
    }
  };

  const addImageInput = () => {
    updateNodeData(id, { imageCount: imageCount + 1 });
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
      <div className="bg-[#1e1e20] rounded-2xl border border-gray-800 shadow-2xl min-w-[340px] font-dm-sans relative">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-200 font-medium text-sm">{label}</span>
            {isLocked && <span className="text-xs text-yellow-500/80">🔒</span>}
          </div>
          <NodeMenu
            onDuplicate={() => duplicateNode(id)}
            onRename={handleRename}
            onLock={() => setNodeLock(id, !isLocked)}
            onDelete={() => deleteNode(id)}
            isLocked={isLocked}
          />
        </div>

        {/* Output Area */}
        <div className="px-5 pb-2">
          <div className="bg-[#2a2a2d] rounded-xl p-4 min-h-[200px] border border-gray-700/50">
            {output ? (
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {output}
              </p>
            ) : (
              <p className="text-gray-500 text-sm italic">
                The generated text will appear here
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 flex items-center justify-between border-t border-gray-800/50 mt-2">
          <button
            onClick={addImageInput}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-200 text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add another image input
          </button>

          <button
            onClick={handleRunModel}
            disabled={isRunning}
            className="flex items-center gap-2 bg-gray-200 hover:bg-white text-black px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            Run Model
          </button>
        </div>

        {/* Handles - System Prompt */}
        <div className="absolute left-0 top-[110px] flex items-center -translate-x-full pr-1.5 group">
          <span className="text-[10px] text-gray-400 group-hover:text-gray-200 transition-colors mr-2">
            Prompt*
          </span>
          <Handle
            type="target"
            position={Position.Left}
            id="prompt"
            className="w-3.5 h-3.5 !bg-purple-500 !border-2 !border-[#1e1e20] !relative !left-0 !top-0 !translate-y-0"
          />
        </div>

        <div className="absolute left-0 top-[150px] flex items-center -translate-x-full pr-1.5 group">
          <span className="text-[10px] text-gray-400 group-hover:text-gray-200 transition-colors mr-2">
            System Prompt
          </span>
          <Handle
            type="target"
            position={Position.Left}
            id="systemPrompt"
            className="w-3.5 h-3.5 !bg-pink-400/80 !border-2 !border-[#1e1e20] !relative !left-0 !top-0 !translate-y-0"
          />
        </div>

        {/* Dynamic Image Handles */}
        {Array.from({ length: imageCount }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 flex items-center -translate-x-full pr-1.5 group"
            style={{ top: `${190 + i * 35}px` }}
          >
            <span className="text-[10px] text-emerald-400/80 group-hover:text-emerald-400 transition-colors mr-2">
              Image {i + 1}
            </span>
            <Handle
              type="target"
              position={Position.Left}
              id={`image_${i + 1}`}
              className="w-3.5 h-3.5 !bg-emerald-500/80 !border-2 !border-[#1e1e20] !relative !left-0 !top-0 !translate-y-0"
            />
          </div>
        ))}

        {/* Output Handle */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center translate-x-full pl-1.5 group">
          <Handle
            type="source"
            position={Position.Right}
            id="output"
            className="w-3.5 h-3.5 !bg-pink-400/80 !border-2 !border-[#1e1e20] !relative !right-0 !top-0 !translate-y-0"
          />
          <span className="text-[10px] text-gray-400 group-hover:text-gray-200 transition-colors ml-2">
            Text
          </span>
        </div>
      </div>

      {/* Rename Dialog */}
      {showRenameDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-[#1e1e20] border border-gray-800 rounded-2xl p-6 w-80 shadow-2xl">
            <h3 className="text-lg font-medium text-gray-200 mb-4">
              Rename Node
            </h3>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#2a2a2d] border border-gray-700 rounded-xl text-gray-200 outline-none focus:border-purple-500/50 transition-colors mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={confirmRename}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-white text-black rounded-lg font-medium transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowRenameDialog(false)}
                className="flex-1 px-4 py-2 bg-[#2a2a2d] hover:bg-[#333336] text-gray-300 rounded-lg font-medium transition-colors"
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

LLMNode.displayName = "LLMNode";
