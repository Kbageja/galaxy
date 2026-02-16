"use client";

import { useCallback, useRef, DragEvent, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  BackgroundVariant,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { LeftSidebar } from "@/app/dashboard/_components/LeftSidebar";
import { RightSidebar } from "@/app/dashboard/_components/RightSidebar";
import {
  TextNode,
  ImageUploadNode,
  VideoUploadNode,
  LLMNode,
  CropImageNode,
  ExtractFrameNode,
} from "@/components/nodes";
import { useWorkflowStore } from "@/lib/store";

const nodeTypes = {
  textNode: TextNode,
  imageUploadNode: ImageUploadNode,
  videoUploadNode: VideoUploadNode,
  llmNode: LLMNode,
  cropImageNode: CropImageNode,
  extractFrameNode: ExtractFrameNode,
};

const initialNodes: Node[] = [];

let id = 0;
const getId = () => `node_${id++}`;

export default function DashboardPage() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Zustand store state and actions
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const onNodesChange = useWorkflowStore((state) => state.onNodesChange);
  const onEdgesChange = useWorkflowStore((state) => state.onEdgesChange);
  const onConnect = useWorkflowStore((state) => state.onConnect);
  const setNodes = useWorkflowStore((state) => state.setNodes);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      const nodeTypeMap: Record<string, string> = {
        "Text Node": "textNode",
        "Upload Image": "imageUploadNode",
        "Upload Video": "videoUploadNode",
        "Run LLM": "llmNode",
        "Crop Image": "cropImageNode",
        "Extract Frame": "extractFrameNode",
      };

      const newNode: Node = {
        id: getId(),
        type: nodeTypeMap[type],
        position,
        data: { label: type },
      };

      setNodes(nodes.concat(newNode));
    },
    [setNodes, nodes],
  );

  return (
    <div
      className="h-screen w-full flex flex-col"
      style={{ backgroundColor: "rgb(18, 18, 18)" }}
    >
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            panOnScroll={true}
            panOnDrag={false}
            selectionOnDrag={true}
            fitView
            style={{ backgroundColor: "rgb(18, 18, 18)" }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={16}
              size={1}
              color="#333"
            />
            <Controls className="bg-[#1e1e1e] border border-gray-700" />
            <MiniMap
              className="bg-[#1e1e1e] border border-gray-700"
              nodeColor="#555"
            />
          </ReactFlow>
        </div>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}
