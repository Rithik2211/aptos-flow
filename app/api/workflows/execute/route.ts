import { NextRequest, NextResponse } from "next/server";
import { executeWorkflow } from "@/lib/workflow-executor";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { workflowId } = body;

        if (!workflowId) {
            return NextResponse.json(
                { error: "Workflow ID is required" },
                { status: 400 }
            );
        }

        // Fetch workflow definition
        const { data: workflow, error } = await supabase
            .from("workflows")
            .select("*")
            .eq("id", workflowId)
            .single();

        if (error || !workflow) {
            return NextResponse.json(
                { error: "Workflow not found" },
                { status: 404 }
            );
        }

        // Parse workflow definition
        const definition = typeof workflow.json_definition === 'string'
            ? JSON.parse(workflow.json_definition)
            : workflow.json_definition;

        // Execute workflow
        const result = await executeWorkflow(workflowId, definition);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error, runId: result.runId },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            runId: result.runId,
            message: "Workflow executed successfully",
        });
    } catch (error: any) {
        console.error("Execution error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
