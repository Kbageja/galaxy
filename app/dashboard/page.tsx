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
import {
  syncUser,
  saveWorkflow,
  getLatestWorkflow,
} from "@/app/actions/workflow";
import { Save } from "lucide-react";
// using window.alert for notifications

const nodeTypes = {
  textNode: TextNode,
  imageUploadNode: ImageUploadNode,
  videoUploadNode: VideoUploadNode,
  llmNode: LLMNode,
  cropImageNode: CropImageNode,
  extractFrameNode: ExtractFrameNode,
};

const initialNodes: Node[] = [];

const getId = () =>
  `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export default function DashboardPage() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Zustand store state and actions
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const onNodesChange = useWorkflowStore((state) => state.onNodesChange);
  const onEdgesChange = useWorkflowStore((state) => state.onEdgesChange);
  const onConnect = useWorkflowStore((state) => state.onConnect);
  const setNodes = useWorkflowStore((state) => state.setNodes);
  const setEdges = useWorkflowStore((state) => state.setEdges);
  const nodeData = useWorkflowStore((state) => state.nodeData);
  const setNodeData = useWorkflowStore((state) => state.setNodeData);
  const isLoading = useWorkflowStore((state) => state.isLoading);
  const setIsLoading = useWorkflowStore((state) => state.setIsLoading);
  const workflowId = useWorkflowStore((state) => state.id);
  const workflowName = useWorkflowStore((state) => state.name);
  const setWorkflowId = useWorkflowStore((state) => state.setId);

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);

        // Parallelize or sequentialize with fallback
        try {
          await syncUser();
        } catch (err) {
          console.error("User sync failed (might be cold start):", err);
        }

        const latest = await getLatestWorkflow();
        if (latest) {
          const w = latest as any;
          setWorkflowId(w.id);
          setNodes(w.nodes || []);
          setEdges(w.edges || []);
          setNodeData(w.nodeData || {});
        }
      } catch (err) {
        console.error("Critical failure during initialization:", err);
        alert(
          "The database is taking a bit longer to respond. Please wait a moment and refresh if the workflow doesn't appear.",
        );
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    init();
  }, [setNodes, setEdges, setWorkflowId, setNodeData, setIsLoading]);

  // Auto-save implementation
  useEffect(() => {
    // Only save if not loading
    if (isLoading) return;

    // Don't save a completely empty new workflow, but save an empty existing one (to allow deletion of all nodes)
    if (nodes.length === 0 && !workflowId) return;

    const timer = setTimeout(async () => {
      try {
        const result = (await saveWorkflow({
          id: workflowId || undefined,
          name: workflowName,
          nodes,
          edges,
          nodeData,
        })) as any;

        // If this was a new workflow, capture the ID so we update it next time
        if (!workflowId && result?.id) {
          setWorkflowId(result.id);
        }
        console.log("Auto-saved workflow");
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [
    nodes,
    edges,
    nodeData,
    workflowId,
    workflowName,
    isLoading,
    setWorkflowId,
  ]);

  const handleSave = async () => {
    try {
      const result = (await saveWorkflow({
        id: workflowId || undefined,
        name: workflowName,
        nodes,
        edges,
        nodeData,
      })) as any;
      setWorkflowId(result.id);
      alert("Workflow saved successfully!");
    } catch (error) {
      console.error("Failed to save workflow:", error);
      alert("Failed to save workflow");
    }
  };

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
      className="h-screen w-full flex flex-col relative"
      style={{ backgroundColor: "rgb(18, 18, 18)" }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#121212]">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute inset-4 border-4 border-indigo-500 border-b-transparent rounded-full animate-spin [animation-duration:3s] scale-x-[-1]"></div>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent animate-pulse font-dm-sans">
            Syncing Galaxy AI...
          </h2>
          <p className="text-gray-500 mt-2 text-sm font-dm-sans">
            Preparing your creative workflow
          </p>
        </div>
      )}
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />

        <button
          onClick={handleSave}
          className="absolute top-4 right-80 z-10 flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 rounded-lg shadow-lg transition-all font-medium text-[10px] uppercase tracking-wider backdrop-blur-md"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {workflowId ? "Auto-save active" : "Auto-save ready"}
        </button>

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
