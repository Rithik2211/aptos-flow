"use client";

import { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  NodeTypes,
  ReactFlowProvider,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { useWorkflowStore } from "@/stores/workflow-store";
import CustomNode from "./CustomNode";

const nodeTypes: NodeTypes = {
  priceTrigger: CustomNode,
  aptosTransfer: CustomNode,
  decibelTrade: CustomNode,
  photonReward: CustomNode,
  qrPaymentTrigger: CustomNode,
  schedule: CustomNode,
  conditionalLogic: CustomNode,
  webhookTrigger: CustomNode,
};

export default function WorkflowCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
  } = useWorkflowStore();

  const defaultEdgeOptions = useMemo(
    () => ({
      type: "default", // Changed from smoothstep to default for smoother bezier curves
      animated: true, // Add flowing animation
      style: {
        stroke: "url(#edge-gradient)", // Use gradient for modern look
        strokeWidth: 2.5,
        filter: "drop-shadow(0 0 8px rgba(79, 158, 255, 0.4))", // Add glow effect
      },
      markerEnd: {
        type: MarkerType.Arrow,
        color: "#4F9EFF",
        width: 20,
        height: 20,
      },
    }),
    []
  );

  return (
    <ReactFlowProvider>
      <div className="w-full h-full bg-[#0D0D0E]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(event, node) => setSelectedNode(node)}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
          fitView={false}
          className="bg-[#0D0D0E]"
        >
          <Background color="#1a1a1a" gap={16} />
          <Controls
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
            }}
          />
          <MiniMap
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
            }}
            nodeColor="#4F9EFF"
            maskColor="rgba(0, 0, 0, 0.5)"
          />

          {/* SVG Gradient Definition for Edges */}
          <svg style={{ position: "absolute", width: 0, height: 0 }}>
            <defs>
              <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4F9EFF" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#7ED4FF" stopOpacity="1" />
                <stop offset="100%" stopColor="#4F9EFF" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}

