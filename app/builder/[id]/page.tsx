"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BuilderHeader from "@/components/layout/BuilderHeader";
import WorkflowCanvas from "@/components/workflow/WorkflowCanvas";
import SidebarPalette from "@/components/workflow/SidebarPalette";
import NodeConfigModal from "@/components/workflow/NodeConfigModal";
import WorkflowRunLogs from "@/components/workflow/WorkflowRunLogs";
import GlassButton from "@/components/ui/GlassButton";
import { useWorkflowStore } from "@/stores/workflow-store";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";

export default function WorkflowBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;
  const isNew = workflowId === "new";

  const {
    nodes,
    edges,
    selectedNode,
    setSelectedNode,
    getWorkflowDefinition,
    loadWorkflow,
    setIsRunning,
  } = useWorkflowStore();

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isNew && isAuthenticated) {
      loadWorkflowData();
    }
  }, [workflowId, isAuthenticated]);

  useEffect(() => {
    if (selectedNode) {
      setIsConfigModalOpen(true);
    }
  }, [selectedNode]);

  const loadWorkflowData = async () => {
    try {
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", workflowId)
        .single();

      if (error) throw error;
      if (data) {
        setWorkflowName(data.name);
        setWorkflowDescription(data.description || "");
        loadWorkflow(data.json_definition);
      }
    } catch (error) {
      console.error("Error loading workflow:", error);
    }
  };

  const handleSave = async () => {
    // TEMPORARILY DISABLED: Skip auth check for development
    // TODO: Re-enable when Photon integration is complete
    /*
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    */

    try {
      // Use dummy user ID for development (bypassing auth)
      const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000000";

      const workflowDefinition = getWorkflowDefinition();

      if (isNew) {
        const { data, error } = await supabase
          .from("workflows")
          .insert({
            user_id: DUMMY_USER_ID,
            name: workflowName,
            description: workflowDescription,
            json_definition: workflowDefinition,
            is_active: false,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          router.push(`/builder/${data.id}`);
        }
      } else {
        const { error } = await supabase
          .from("workflows")
          .update({
            name: workflowName,
            description: workflowDescription,
            json_definition: workflowDefinition,
          })
          .eq("id", workflowId);

        if (error) throw error;
        alert("Workflow saved successfully!");
      }
    } catch (error) {
      console.error("Error saving workflow:", error);
      alert("Failed to save workflow");
    }
  };

  const handleRun = async () => {
    // TEMPORARILY DISABLED: Skip auth check for development
    /*
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    */

    if (workflowId === "new") {
      alert("Please save the workflow first before running it.");
      return;
    }

    setIsRunning(true);
    try {
      const response = await fetch("/api/workflows/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workflowId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to execute workflow");
      }

      alert(`Workflow execution started! Run ID: ${data.runId}`);
    } catch (error: any) {
      console.error("Error running workflow:", error);
      alert(`Execution failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // TEMPORARILY DISABLED: Authentication check bypassed for development
  // TODO: Re-enable authentication when Photon integration is complete
  /*
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0D0D0E]">
        <NavbarFloating />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-400 mb-6">
              Please connect your wallet to build workflows.
            </p>
            <button onClick={() => router.push("/auth")}>
              <GlassButton variant="primary">Connect Wallet</GlassButton>
            </button>
          </div>
        </div>
      </div>
    );
  }
  */

  return (
    <div className="h-screen bg-[#0D0D0E] flex flex-col overflow-hidden">
      <BuilderHeader
        workflowName={workflowName}
        onWorkflowNameChange={setWorkflowName}
        onSave={handleSave}
        onRun={handleRun}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden pt-16">
        {/* Sidebar */}
        <SidebarPalette />

        {/* Canvas */}
        <div className="flex-1 relative">
          <WorkflowCanvas />
        </div>

        {/* Right Sidebar - Logs */}
        {!isNew && (
          <div className="w-80 border-l border-white/10 p-4 overflow-y-auto">
            <WorkflowRunLogs workflowId={workflowId} />
          </div>
        )}
      </div>

      {/* Node Config Modal */}
      <NodeConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setSelectedNode(null);
        }}
      />
    </div>
  );
}

