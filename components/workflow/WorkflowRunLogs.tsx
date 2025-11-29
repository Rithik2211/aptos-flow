"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { WorkflowRun } from "@/lib/supabase";
import GlowCard from "@/components/ui/GlowCard";

interface WorkflowRunLogsProps {
  workflowId: string;
}

export default function WorkflowRunLogs({ workflowId }: WorkflowRunLogsProps) {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <GlowCard className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#4F9EFF] animate-spin" />
        </div>
      </GlowCard>
    );
  }

  return (
    <GlowCard className="p-6">
      <h3 className="text-lg font-bold text-white mb-4">Execution History</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {runs.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No runs yet</p>
        ) : (
          runs.map((run) => (
            <motion.div
              key={run.id}
              className="glass p-4 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(run.status)}
                  <span className={`font-medium ${getStatusColor(run.status)}`}>
                    {run.status}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(run.executed_at).toLocaleString()}
                </span>
              </div>
              {run.trigger_type && (
                <p className="text-sm text-gray-300 mb-1">
                  Trigger: {run.trigger_type}
                </p>
              )}
              {run.logs && (
                <details className="mt-2">
                  <summary className="text-sm text-gray-400 cursor-pointer hover:text-white">
                    View Logs
                  </summary>
                  <pre className="mt-2 text-xs text-gray-500 bg-black/20 p-2 rounded overflow-x-auto">
                    {run.logs}
                  </pre>
                </details>
              )}
            </motion.div>
          ))
        )}
      </div>
    </GlowCard>
  );
}

