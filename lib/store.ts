import { create } from "zustand";
import {
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  NodeChange,
  EdgeChange,
  Connection,
} from "reactflow";

interface NodeData {
  [key: string]: any;
}

// Handle types for validation
export type HandleType = "text" | "image" | "video" | "file" | "any";

export interface HandleInfo {
  id: string;
  type: HandleType;
  label?: string;
}

export interface ExecutionLog {
  id: string;
  nodeId: string;
  nodeLabel: string;
  status: "success" | "error" | "running";
  duration?: number;
  output?: any;
  error?: string;
}

export interface WorkflowRun {
  id: string;
  timestamp: string;
  status: "completed" | "failed" | "running";
  logs: ExecutionLog[];
}

interface WorkflowState {
  id: string | null;
  name: string;
  nodes: Node[];
  edges: Edge[];
  nodeData: Record<string, NodeData>;
  nodeHandles: Record<string, { inputs: HandleInfo[]; outputs: HandleInfo[] }>;
  workflowHistory: WorkflowRun[];
  isLoading: boolean;
  setId: (id: string | null) => void;
  setName: (name: string) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setNodeData: (data: Record<string, NodeData>) => void;
  setIsLoading: (isLoading: boolean) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  getNodeData: (nodeId: string) => NodeData | undefined;
  getConnectedNodeData: (nodeId: string, handleId: string) => any;
  registerNodeHandles: (
    nodeId: string,
    inputs: HandleInfo[],
    outputs: HandleInfo[],
  ) => void;
  canConnect: (
    sourceNodeId: string,
    sourceHandleId: string,
    targetNodeId: string,
    targetHandleId: string,
  ) => boolean;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  renameNode: (nodeId: string, name: string) => void;
  setNodeLock: (nodeId: string, locked: boolean) => void;
  addWorkflowRun: (run: WorkflowRun) => void;
  updateWorkflowRun: (runId: string, run: Partial<WorkflowRun>) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  id: null,
  name: "Untitled Workflow",
  nodes: [],
  edges: [],
  nodeData: {},
  nodeHandles: {},
  workflowHistory: [],
  isLoading: true,

  setId: (id) => set({ id }),
  setName: (name) => set({ name }),

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setNodeData: (nodeData) => set({ nodeData }),
  setIsLoading: (isLoading) => set({ isLoading }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodeData: {
        ...state.nodeData,
        [nodeId]: {
          ...state.nodeData[nodeId],
          ...data,
        },
      },
    })),

  getNodeData: (nodeId) => get().nodeData[nodeId],

  // Get data from connected source node
  getConnectedNodeData: (nodeId, handleId) => {
    const { edges, nodeData } = get();

    // Find edge connected to this node's input handle
    const connectedEdge = edges.find(
      (edge) => edge.target === nodeId && edge.targetHandle === handleId,
    );

    if (!connectedEdge) return null;

    // Get source node data
    const sourceNodeData = nodeData[connectedEdge.source];
    if (!sourceNodeData) return null;

    // Return data from the specific output handle
    return sourceNodeData[connectedEdge.sourceHandle || "output"];
  },

  registerNodeHandles: (nodeId, inputs, outputs) =>
    set((state) => ({
      nodeHandles: {
        ...state.nodeHandles,
        [nodeId]: { inputs, outputs },
      },
    })),

  deleteNode: (nodeId) => {
    set((state) => {
      const { [nodeId]: _, ...newNodeData } = state.nodeData;
      const { [nodeId]: __, ...newNodeHandles } = state.nodeHandles;

      return {
        nodes: state.nodes.filter((node) => node.id !== nodeId),
        edges: state.edges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId,
        ),
        nodeData: newNodeData,
        nodeHandles: newNodeHandles,
      };
    });
  },

  duplicateNode: (nodeId) => {
    const { nodes, nodeData } = get();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const newNodeId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newNode: Node = {
      ...node,
      id: newNodeId,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      selected: false,
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      nodeData: {
        ...state.nodeData,
        [newNodeId]: { ...state.nodeData[nodeId] },
      },
    }));
  },

  renameNode: (nodeId, name) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: name } }
          : node,
      ),
    }));
  },

  setNodeLock: (nodeId, locked) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              draggable: !locked,
              selectable: !locked,
              data: { ...node.data, isLocked: locked },
            }
          : node,
      ),
    }));
  },

  canConnect: (sourceNodeId, sourceHandleId, targetNodeId, targetHandleId) => {
    const { nodeHandles } = get();

    const sourceNode = nodeHandles[sourceNodeId];
    const targetNode = nodeHandles[targetNodeId];

    if (!sourceNode || !targetNode) return true; // Allow if not registered yet

    const sourceHandle = sourceNode.outputs.find(
      (h) => h.id === sourceHandleId,
    );
    const targetHandle = targetNode.inputs.find((h) => h.id === targetHandleId);

    if (!sourceHandle || !targetHandle) return true;

    // Allow 'any' type to connect to anything
    if (sourceHandle.type === "any" || targetHandle.type === "any") return true;

    // File type can connect to image or video
    if (
      sourceHandle.type === "file" &&
      (targetHandle.type === "image" || targetHandle.type === "video")
    )
      return true;
    if (
      targetHandle.type === "file" &&
      (sourceHandle.type === "image" || sourceHandle.type === "video")
    )
      return true;

    // Otherwise, types must match
    return sourceHandle.type === targetHandle.type;
  },

  addWorkflowRun: (run) =>
    set((state) => ({
      workflowHistory: [run, ...state.workflowHistory],
    })),

  updateWorkflowRun: (runId, updates) =>
    set((state) => ({
      workflowHistory: state.workflowHistory.map((run) =>
        run.id === runId ? { ...run, ...updates } : run,
      ),
    })),
}));
