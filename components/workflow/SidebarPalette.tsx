"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Send,
  BarChart3,
  Gift,
  QrCode,
  Clock,
  GitBranch,
  Webhook,
} from "lucide-react";
import { useWorkflowStore } from "@/stores/workflow-store";
import { NodeType } from "@/types/workflow";
import NodeCardGlass from "@/components/ui/NodeCardGlass";

interface NodeTemplate {
  type: NodeType;
  label: string;
  description: string;
  icon: typeof TrendingUp;
  category: "trigger" | "action" | "logic";
}

const nodeTemplates: NodeTemplate[] = [
  {
    type: "priceTrigger",
    label: "Price Trigger",
    description: "Trigger when price reaches threshold",
    icon: TrendingUp,
    category: "trigger",
  },
  {
    type: "aptosTransfer",
    label: "Aptos Transfer",
    description: "Send APT or tokens",
    icon: Send,
    category: "action",
  },
  {
    type: "decibelTrade",
    label: "Decibel Trade",
    description: "Execute trade on Decibel",
    icon: BarChart3,
    category: "action",
  },
  {
    type: "photonReward",
    label: "Photon Reward",
    description: "Trigger reward event",
    icon: Gift,
    category: "action",
  },
  {
    type: "qrPaymentTrigger",
    label: "QR Payment",
    description: "Trigger on QR payment",
    icon: QrCode,
    category: "trigger",
  },
  {
    type: "schedule",
    label: "Schedule",
    description: "Run on schedule (cron)",
    icon: Clock,
    category: "trigger",
  },
  {
    type: "conditionalLogic",
    label: "Conditional",
    description: "If/else logic",
    icon: GitBranch,
    category: "logic",
  },
  {
    type: "webhookTrigger",
    label: "Webhook",
    description: "Trigger via webhook",
    icon: Webhook,
    category: "trigger",
  },
];

export default function SidebarPalette() {
  const { addNode } = useWorkflowStore();

  const onDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType, label: string) => {
      event.dataTransfer.setData("application/reactflow", nodeType);
      event.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleNodeClick = useCallback(
    (template: NodeTemplate) => {
      const newNode = {
        id: `${template.type}-${Date.now()}`,
        type: template.type,
        position: {
          x: Math.random() * 400,
          y: Math.random() * 400,
        },
        data: {
          label: template.label,
          type: template.type,
          config: {},
        },
      };
      addNode(newNode);
    },
    [addNode]
  );

  const triggers = nodeTemplates.filter((n) => n.category === "trigger");
  const actions = nodeTemplates.filter((n) => n.category === "action");
  const logic = nodeTemplates.filter((n) => n.category === "logic");

  return (
    <div className="w-64 h-full glass overflow-y-auto p-4 space-y-6">
      <h2 className="text-lg font-bold text-white mb-4">Node Palette</h2>

      {/* Triggers */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          Triggers
        </h3>
        <div className="space-y-2">
          {triggers.map((template) => (
            <div
              key={template.type}
              draggable
              onDragStart={(e: React.DragEvent<HTMLDivElement>) => onDragStart(e, template.type, template.label)}
              onClick={() => handleNodeClick(template)}
            >
              <NodeCardGlass
                icon={template.icon}
                title={template.label}
                description={template.description}
                category="trigger"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          Actions
        </h3>
        <div className="space-y-2">
          {actions.map((template) => (
            <div
              key={template.type}
              draggable
              onDragStart={(e: React.DragEvent<HTMLDivElement>) => onDragStart(e, template.type, template.label)}
              onClick={() => handleNodeClick(template)}
            >
              <NodeCardGlass
                icon={template.icon}
                title={template.label}
                description={template.description}
                category="action"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Logic */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          Logic
        </h3>
        <div className="space-y-2">
          {logic.map((template) => (
            <div
              key={template.type}
              draggable
              onDragStart={(e: React.DragEvent<HTMLDivElement>) => onDragStart(e, template.type, template.label)}
              onClick={() => handleNodeClick(template)}
            >
              <NodeCardGlass
                icon={template.icon}
                title={template.label}
                description={template.description}
                category="logic"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

