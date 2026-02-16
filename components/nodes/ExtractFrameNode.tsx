"use client";

import { memo, useEffect, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Download } from "lucide-react";
import { useWorkflowStore, type HandleInfo } from "@/lib/store";
import { NodeMenu } from "./NodeMenu";

export const ExtractFrameNode = memo(({ id, data }: NodeProps) => {
  const nodeData = useWorkflowStore((state) => state.nodeData[id]);
  const isLocked = useWorkflowStore(
    (state) => state.nodes.find((n) => n.id === id)?.data?.isLocked || false,
  );
  const label = useWorkflowStore(
    (state) =>
      state.nodes.find((n) => n.id === id)?.data?.label || "Extract Frame",
  );

  // Reactive connection data
  const connectedVideo = useWorkflowStore((state) => {
    const edges = state.edges;
    const connectedEdge = edges.find(
      (edge) => edge.target === id && edge.targetHandle === "videoInput",
    );
    if (!connectedEdge) return null;
    return state.nodeData[connectedEdge.source]?.[
      connectedEdge.sourceHandle || "output"
    ];
  });

  const timestamp = nodeData?.timestamp || "0";
  const [extractedFrame, setExtractedFrame] = useState<string | null>(null);

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
      { id: "videoInput", type: "video", label: "Video Input" },
    ];
    const outputs: HandleInfo[] = [
      { id: "output", type: "image", label: "Frame Output" },
    ];
    registerNodeHandles(id, inputs, outputs);
  }, [id, registerNodeHandles]);

  // Extract frame from video
  useEffect(() => {
    if (!connectedVideo) {
      setExtractedFrame(null);
      return;
    }

    const video = document.createElement("video");
    video.src = connectedVideo;
    video.crossOrigin = "anonymous";

    video.onloadedmetadata = () => {
      let timeInSeconds = 0;
      if (timestamp.includes("%")) {
        timeInSeconds = (parseFloat(timestamp) / 100) * video.duration;
      } else if (timestamp.includes(":")) {
        const parts = timestamp.split(":").map(Number);
        timeInSeconds = parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
      } else {
        timeInSeconds = parseFloat(timestamp.replace("s", ""));
      }
      video.currentTime = Math.min(timeInSeconds, video.duration);
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const frameDataUrl = canvas.toDataURL("image/png");
        setExtractedFrame(frameDataUrl);
        updateNodeData(id, { output: frameDataUrl });
      }
    };
  }, [connectedVideo, timestamp, id, updateNodeData]);

  const handleDownload = () => {
    if (!extractedFrame) return;
    const link = document.createElement("a");
    link.download = `frame-${timestamp}-${Date.now()}.png`;
    link.href = extractedFrame;
    link.click();
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
            <div className="text-s text-gray-200 uppercase tracking-tighter">
              {label}
            </div>
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
        <div className="p-4 space-y-3">
          {/* Video Preview Section */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block font-dm-sans">
              Video Preview
            </label>
            <div
              className="rounded-lg border border-gray-700 overflow-hidden flex items-center justify-center bg-black relative"
              style={{ width: "274.04px", height: "154px" }}
            >
              {connectedVideo ? (
                <video
                  src={connectedVideo}
                  className="w-full h-full object-contain"
                  controls
                  muted
                  playsInline
                />
              ) : (
                <div className="text-[10px] text-gray-600 font-dm-sans text-center px-4">
                  Connect a video source to see preview
                </div>
              )}
            </div>
          </div>

          {/* Timestamp Controls */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block font-dm-sans">
              Timestamp (e.g., 00:00:05, 5s, or 10%)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="00:00:05"
                value={timestamp}
                onChange={(e) =>
                  updateNodeData(id, { timestamp: e.target.value })
                }
                className="nodrag flex-1 px-3 py-2 text-sm bg-[#2a2a2a] border border-gray-600 rounded-lg text-gray-200 outline-none focus:border-gray-500 font-dm-sans"
              />
            </div>
          </div>

          {/* Extraction Preview Section */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block font-dm-sans">
              Extracted Frame
            </label>
            <div
              className="rounded-lg border border-gray-700 overflow-hidden flex items-center justify-center relative"
              style={{
                width: "274.04px",
                height: "154px",
                backgroundImage: !extractedFrame
                  ? `
                  linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
                  linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
                  linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)
                `
                  : "none",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                backgroundColor: "#1a1a1a",
              }}
            >
              {extractedFrame ? (
                <img
                  src={extractedFrame}
                  alt="Extracted frame"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-gray-600 font-dm-sans">
                  No frame extracted
                </span>
              )}
            </div>
          </div>

          {extractedFrame && (
            <button
              onClick={handleDownload}
              className="nodrag w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm text-white transition-colors font-dm-sans"
            >
              <Download className="w-4 h-4" />
              Download Frame
            </button>
          )}
        </div>

        {/* Handles */}
        <Handle
          type="target"
          position={Position.Left}
          id="videoInput"
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

ExtractFrameNode.displayName = "ExtractFrameNode";
