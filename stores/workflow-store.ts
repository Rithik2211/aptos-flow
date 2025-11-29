import { create } from "zustand";
import { Node, Edge, addEdge, applyNodeChanges, applyEdgeChanges, Connection } from "reactflow";
import { WorkflowNode, WorkflowDefinition } from "@/types/workflow";

interface WorkflowStore {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  isRunning: boolean;
  
  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  updateNode: (nodeId: string, data: Partial<WorkflowNode["data"]>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (node: Node | null) => void;
  setIsRunning: (isRunning: boolean) => void;
  getWorkflowDefinition: () => WorkflowDefinition;
  loadWorkflow: (definition: WorkflowDefinition) => void;
  reset: () => void;
}

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,
  isRunning: false,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

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

  addNode: (node) => {
    // Ensure node has proper structure for React Flow
    const reactFlowNode = {
      ...node,
      type: node.type || node.data?.type,
      data: {
        ...node.data,
        type: node.type || node.data?.type,
      },
    };
    set({
      nodes: [...get().nodes, reactFlowNode],
    });
  },

  updateNode: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
    });
  },

  setSelectedNode: (node) => set({ selectedNode: node }),
  setIsRunning: (isRunning) => set({ isRunning }),

  getWorkflowDefinition: () => ({
    nodes: get().nodes as WorkflowNode[],
    edges: get().edges,
  }),

  loadWorkflow: (definition) => {
    set({
      nodes: definition.nodes,
      edges: definition.edges,
    });
  },

  reset: () => {
    set({
      nodes: initialNodes,
      edges: initialEdges,
      selectedNode: null,
      isRunning: false,
    });
  },
}));

