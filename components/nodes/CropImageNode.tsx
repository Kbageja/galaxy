"use client";

import { memo, useEffect, useState, useRef, useMemo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Download } from "lucide-react";
import { useWorkflowStore, type HandleInfo } from "@/lib/store";
import { NodeMenu } from "./NodeMenu";

export const CropImageNode = memo(({ id, data }: NodeProps) => {
  const nodeData = useWorkflowStore((state) => state.nodeData[id]);
  const isLocked = useWorkflowStore(
    (state) => state.nodes.find((n) => n.id === id)?.data?.isLocked || false,
  );
  const label = useWorkflowStore(
    (state) =>
      state.nodes.find((n) => n.id === id)?.data?.label || "Crop Image",
  );

  // Reactive connection data
  const connectedImage = useWorkflowStore((state) => {
    const edges = state.edges;
    const connectedEdge = edges.find(
      (edge) => edge.target === id && edge.targetHandle === "imageInput",
    );
    if (!connectedEdge) return null;
    return state.nodeData[connectedEdge.source]?.[
      connectedEdge.sourceHandle || "output"
    ];
  });

  const x = nodeData?.x ?? 0;
  const y = nodeData?.y ?? 0;
  const width = nodeData?.width ?? 100;
  const height = nodeData?.height ?? 100;

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Register handles
  useEffect(() => {
    const inputs: HandleInfo[] = [
      { id: "imageInput", type: "image", label: "Image Input" },
    ];
    const outputs: HandleInfo[] = [
      { id: "output", type: "image", label: "Cropped Image" },
    ];
    registerNodeHandles(id, inputs, outputs);
  }, [id, registerNodeHandles]);

  // Draw cropped preview
  useEffect(() => {
    if (!connectedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const cropX = (x / 100) * img.width;
      const cropY = (y / 100) * img.height;
      const cropWidth = (width / 100) * img.width;
      const cropHeight = (height / 100) * img.height;

      canvas.width = cropWidth || img.width;
      canvas.height = cropHeight || img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth || img.width,
        cropHeight || img.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      // Update output in store
      updateNodeData(id, { output: canvas.toDataURL() });
    };
    img.src = connectedImage;
  }, [connectedImage, x, y, width, height, id, updateNodeData]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `cropped-image-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
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
        <div className="p-4 space-y-3">
          <div
            className="rounded-lg border border-gray-700 overflow-hidden flex items-center justify-center"
            style={{
              width: "274.04px",
              height: "274.04px",
              backgroundImage: !connectedImage
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
            {connectedImage ? (
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-xs text-gray-500">
                Waiting for image connection...
              </span>
            )}
          </div>

          {connectedImage && (
            <button
              onClick={handleDownload}
              className="nodrag w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Cropped Image
            </button>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              {
                label: "X (%)",
                value: x,
                setter: (val: number) => updateNodeData(id, { x: val }),
              },
              {
                label: "Y (%)",
                value: y,
                setter: (val: number) => updateNodeData(id, { y: val }),
              },
              {
                label: "Width (%)",
                value: width,
                setter: (val: number) => updateNodeData(id, { width: val }),
              },
              {
                label: "Height (%)",
                value: height,
                setter: (val: number) => updateNodeData(id, { height: val }),
              },
            ].map((ctrl) => (
              <div key={ctrl.label}>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block font-dm-sans">
                  {ctrl.label}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={ctrl.value}
                  onChange={(e) => ctrl.setter(Number(e.target.value))}
                  className="nodrag w-full px-2 py-1.5 text-sm bg-[#2a2a2a] border border-gray-600 rounded text-gray-200 outline-none focus:border-gray-500 font-dm-sans"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Handles */}
        <Handle
          type="target"
          position={Position.Left}
          id="imageInput"
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

CropImageNode.displayName = "CropImageNode";
