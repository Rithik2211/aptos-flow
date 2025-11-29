"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useWorkflowStore } from "@/stores/workflow-store";
import { NodeType } from "@/types/workflow";
import GlassButton from "@/components/ui/GlassButton";

interface NodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const nodeConfigFields: Record<NodeType, Array<{ key: string; label: string; type: string }>> = {
  priceTrigger: [
    { key: "token", label: "Token Pair", type: "text" },
    { key: "threshold", label: "Price Threshold", type: "number" },
    { key: "condition", label: "Condition", type: "select" },
  ],
  aptosTransfer: [
    { key: "recipient", label: "Recipient Address", type: "text" },
    { key: "amount", label: "Amount (APT)", type: "number" },
  ],
  decibelTrade: [
    { key: "fromToken", label: "From Token (e.g., APT)", type: "text" },
    { key: "toToken", label: "To Token (e.g., USDC)", type: "text" },
    { key: "amount", label: "Amount", type: "number" },
    { key: "slippage", label: "Slippage (%)", type: "number" },
  ],
  photonReward: [
    { key: "eventType", label: "Event Type", type: "text" },
    { key: "eventId", label: "Event ID (optional)", type: "text" },
    { key: "campaignId", label: "Campaign ID (optional)", type: "text" },
    { key: "clientUserId", label: "Client User ID", type: "text" },
  ],
  qrPaymentTrigger: [
    { key: "qrCode", label: "QR Code", type: "text" },
    { key: "amount", label: "Amount", type: "number" },
  ],
  schedule: [
    { key: "cron", label: "Cron Expression", type: "text" },
    { key: "timezone", label: "Timezone", type: "text" },
  ],
  conditionalLogic: [
    { key: "condition", label: "Condition", type: "text" },
    { key: "truePath", label: "True Path", type: "text" },
    { key: "falsePath", label: "False Path", type: "text" },
  ],
  webhookTrigger: [
    { key: "url", label: "Webhook URL", type: "text" },
    { key: "method", label: "HTTP Method", type: "select" },
  ],
};

export default function NodeConfigModal({ isOpen, onClose }: NodeConfigModalProps) {
  const { selectedNode, updateNode, deleteNode } = useWorkflowStore();
  const [config, setConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    if (selectedNode) {
      setConfig(selectedNode.data.config || {});
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const nodeType = selectedNode.data.type as NodeType;
  const fields = nodeConfigFields[nodeType] || [];

  const handleSave = () => {
    updateNode(selectedNode.id, { config });
    onClose();
  };

  const handleChange = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/20 z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-y-0 right-0 w-96 bg-[#0D0D0E]/95 backdrop-blur-xl border-l border-white/10 z-[1000] p-6 shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Configure {selectedNode.data.label}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <select
                      className="w-full glass px-4 py-2 rounded-lg text-white bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] focus:outline-none focus:ring-2 focus:ring-[#4F9EFF]"
                      value={config[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    >
                      <option value="">Select...</option>
                      {field.key === "condition" && (
                        <>
                          <option value="above">Above</option>
                          <option value="below">Below</option>
                        </>
                      )}
                      {field.key === "side" && (
                        <>
                          <option value="buy">Buy</option>
                          <option value="sell">Sell</option>
                        </>
                      )}
                      {field.key === "method" && (
                        <>
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                        </>
                      )}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      className="w-full glass px-4 py-2 rounded-lg text-white bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] focus:outline-none focus:ring-2 focus:ring-[#4F9EFF]"
                      value={config[field.key] || ""}
                      onChange={(e) =>
                        handleChange(
                          field.key,
                          field.type === "number"
                            ? parseFloat(e.target.value) || 0
                            : e.target.value
                        )
                      }
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <GlassButton
                variant="secondary"
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20"
                onClick={() => {
                  deleteNode(selectedNode.id);
                  onClose();
                }}
              >
                Delete Node
              </GlassButton>
              <GlassButton
                variant="primary"
                className="flex-1"
                onClick={handleSave}
              >
                Save Changes
              </GlassButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

