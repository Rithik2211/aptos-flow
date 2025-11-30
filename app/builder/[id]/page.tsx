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
import toast, { Toaster } from "react-hot-toast";

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
    if (!isNew) {
      loadWorkflowData();
    }
  }, [workflowId]);

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
          router.push(`/ builder / ${data.id} `);
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
        toast.success("Workflow saved successfully!");
      }
    } catch (error) {
      console.error("Error saving workflow:", error);
      toast.error("Failed to save workflow");
    }
  };

  const handleRunWorkflow = async () => {
    // TEMPORARILY DISABLED: Skip auth check for development
    /*
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    */

    if (workflowId === "new") {
      toast.error("Please save the workflow first before running it.");
      return;
    }

    setIsRunning(true);
    const toastId = toast.loading("🚀 Starting workflow execution...");

    try {
      const workflowDefinition = {
        nodes,
        edges,
      };

      const response = await fetch("/api/workflows/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: workflowId,
          definition: workflowDefinition,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to execute workflow");
      }

      if (result.success) {
        toast.success(`✅ Workflow completed! Check execution history below.`, { id: toastId, duration: 5000 });
      } else {
        toast.error(`❌ Workflow failed: ${result.error} `, { id: toastId, duration: 6000 });
      }
    } catch (error: any) {
      console.error("Error running workflow:", error);
      toast.error(`❌ Execution failed: ${error.message} `, { id: toastId, duration: 6000 });
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
        onRun={handleRunWorkflow}
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

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(13, 13, 14, 0.95)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
          },
          success: {
            iconTheme: {
              primary: "#4F9EFF",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
}

