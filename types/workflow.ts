import { Node, Edge } from "reactflow";

export type NodeType =
  | "priceTrigger"
  | "aptosTransfer"
  | "decibelTrade"
  | "photonReward"
  | "qrPaymentTrigger"
  | "schedule"
  | "conditionalLogic"
  | "webhookTrigger";

export interface WorkflowNode extends Node {
  type: NodeType;
  data: {
    label: string;
    config?: Record<string, any>;
  };
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: Edge[];
}

export interface NodeConfig {
  [key: string]: any;
}

