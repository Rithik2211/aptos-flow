import { NextResponse } from "next/server";
import { executeWorkflow } from "@/lib/workflow-executor";

export async function GET() {
    try {
        console.log("Starting test execution...");

        // Mock Workflow Definition
        const definition = {
            nodes: [
                {
                    id: "node-1",
                    type: "schedule",
                    data: { label: "Schedule", type: "schedule", config: { cron: "* * * * *" } },
                    position: { x: 0, y: 0 },
                },
                {
                    id: "node-2",
                    type: "decibelTrade",
                    data: {
                        label: "Decibel Trade",
                        type: "decibelTrade",
                        config: {
                            fromToken: "APT",
                            toToken: "USDC",
                            amount: 0.1,
                            slippage: 0.5
                        }
                    },
                    position: { x: 200, y: 0 },
                },
            ],
            edges: [
                { id: "edge-1", source: "node-1", target: "node-2" },
            ],
        };

        // Use a dummy workflow ID (must exist in DB for foreign key constraint, or we need to handle that)
        // If we use a random ID, the DB insert might fail if foreign key is enforced.
        // Let's assume we need a valid ID. 
        // For testing, we might need to skip DB logging if ID is invalid.

        // Actually, executeWorkflow tries to insert into workflow_runs.
        // If workflow_id doesn't exist in workflows table, it will fail.

        // So we need to fetch a valid workflow ID first.
        // Or we can modify executeWorkflow to support "test" mode.

        // Let's try to run it with a placeholder and see if it fails on DB.
        // If it fails on DB, we know the logic is trying to run.

        const result = await executeWorkflow("test-workflow-id", definition);

        return NextResponse.json({
            success: result.success,
            runId: result.runId,
            error: result.error,
            message: "Test execution completed",
        });
    } catch (error: any) {
        console.error("Test execution error:", error);
        return NextResponse.json(
            { error: error.message || "Test failed" },
            { status: 500 }
        );
    }
}
