"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Send, 
  BarChart3, 
  Gift, 
  QrCode, 
  Clock, 
  GitBranch,
  Webhook
} from "lucide-react";
import { NodeType } from "@/types/workflow";

const nodeIcons: Record<NodeType, typeof TrendingUp> = {
  priceTrigger: TrendingUp,
  aptosTransfer: Send,
  decibelTrade: BarChart3,
  photonReward: Gift,
  qrPaymentTrigger: QrCode,
  schedule: Clock,
  conditionalLogic: GitBranch,
  webhookTrigger: Webhook,
};

const nodeColors: Record<NodeType, string> = {
  priceTrigger: "#4F9EFF",
  aptosTransfer: "#7ED4FF",
  decibelTrade: "#4F9EFF",
  photonReward: "#7ED4FF",
  qrPaymentTrigger: "#4F9EFF",
  schedule: "#7ED4FF",
  conditionalLogic: "#4F9EFF",
  webhookTrigger: "#7ED4FF",
};

function CustomNode({ data, selected, id }: NodeProps) {
  // React Flow passes type in data.type, but we also store it in data.data.type
  const nodeType = (data.type || (data as any).data?.type) as NodeType;
  const Icon = nodeIcons[nodeType] || TrendingUp;
  const color = nodeColors[nodeType] || "#4F9EFF";

  return (
    <motion.div
      className={`glass px-4 py-3 min-w-[180px] ${
        selected ? "ring-2 ring-[#4F9EFF]" : ""
      }`}
      style={{
        borderColor: selected ? color : "rgba(255, 255, 255, 0.15)",
      }}
      whileHover={{ scale: 1.02 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[#4F9EFF] !border-2 !border-[#0D0D0E]"
      />
      
      <div className="flex items-center gap-2 mb-2">
        <Icon size={18} style={{ color }} />
        <span className="text-sm font-semibold text-white">{data.label}</span>
      </div>
      
      {data.config && Object.keys(data.config).length > 0 && (
        <div className="text-xs text-gray-400 mt-1">
          {Object.entries(data.config)
            .slice(0, 2)
            .map(([key, value]) => (
              <div key={key} className="truncate">
                {key}: {String(value)}
              </div>
            ))}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[#4F9EFF] !border-2 !border-[#0D0D0E]"
      />
    </motion.div>
  );
}

export default memo(CustomNode);

