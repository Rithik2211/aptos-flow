"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Clock, Copy, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { WorkflowRun } from "@/lib/supabase";
import GlowCard from "@/components/ui/GlowCard";

interface WorkflowRunLogsProps {
  workflowId: string;
}

export default function WorkflowRunLogs({ workflowId }: WorkflowRunLogsProps) {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    fetchRuns();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`workflow-runs:${workflowId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workflow_runs",
          filter: `workflow_id=eq.${workflowId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            fetchRuns();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workflowId]);

  const fetchRuns = async () => {
    try {
      const { data, error } = await supabase
        .from("workflow_runs")
        .select("*")
        .eq("workflow_id", workflowId)
        .order("executed_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setRuns(data || []);
    } catch (error) {
      console.error("Error fetching runs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: WorkflowRun["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "running":
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: WorkflowRun["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "failed":
        return "text-red-400";
      case "running":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Helper to extract transaction hash from logs or output
  const getTransactionHash = (run: WorkflowRun) => {
    // Check output first
    if (run.output && typeof run.output === 'object' && 'transactionHash' in run.output) {
      return (run.output as any).transactionHash;
    }

    // Check logs for regex match
    if (run.logs) {
      const match = run.logs.match(/0x[a-fA-F0-9]{64}/);
      if (match) return match[0];
    }

    return null;
  };

  return (
    <GlowCard className="h-full flex flex-col bg-[#0D0D0E]/80 backdrop-blur-xl border-l border-white/10">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Clock size={16} className="text-[#4F9EFF]" />
          Execution History
        </h3>
        {isLoading && <Loader2 size={16} className="animate-spin text-[#4F9EFF]" />}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {runs.length === 0 && !isLoading ? (
          <div className="text-center text-gray-500 py-8">
            No runs yet
          </div>
        ) : (
          runs.map((run) => {
            const txHash = getTransactionHash(run);

            return (
              <motion.div
                key={run.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {run.status === "completed" ? (
                      <CheckCircle size={16} className="text-green-400" />
                    ) : (
                      <XCircle size={16} className="text-red-400" />
                    )}
                    <span className={`text-sm font-medium ${run.status === "completed" ? "text-green-400" : "text-red-400"
                      }`}>
                      {run.status === "completed" ? "Success" : "Failed"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(run.executed_at).toLocaleString()}
                  </span>
                </div>

                {run.trigger_type && (
                  <p className="text-xs text-gray-400 mb-2">
                    Trigger: <span className="text-gray-300">{run.trigger_type}</span>
                  </p>
                )}

                {/* Transaction Hash Display */}
                {txHash && (
                  <div className="mt-2 mb-2 bg-black/30 rounded p-2 flex items-center justify-between group">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">Transaction Hash</span>
                      <span className="text-xs text-[#4F9EFF] font-mono truncate max-w-[180px]">
                        {txHash.slice(0, 6)}...{txHash.slice(-6)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(txHash);
                      }}
                      className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      title="Copy Hash"
                    >
                      {copiedHash === txHash ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                )}

                {run.logs && (
                  <details className="mt-2 group">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 flex items-center gap-1 select-none">
                      <span>View Logs</span>
                    </summary>
                    <pre className="mt-2 text-[10px] text-gray-400 bg-black/40 p-2 rounded overflow-x-auto font-mono leading-relaxed border border-white/5">
                      {run.logs}
                    </pre>
                  </details>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </GlowCard>
  );
}
