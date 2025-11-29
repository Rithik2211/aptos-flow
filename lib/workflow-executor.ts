import { supabase } from "./supabase";
import { transferAPT, getAccountBalance } from "./aptos";
import { getQuote, executeSwap } from "./decibel";

export interface WorkflowNode {
  id: string;
  type: string;
  data: {
    label: string;
    type: string;
    config: Record<string, any>;
  };
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ExecutionContext {
  workflowId: string;
  runId: string;
  variables: Record<string, any>;
}

export interface NodeExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  transactionHash?: string;
}

/**
 * Execute a single workflow node
 */
async function executeNode(
  node: WorkflowNode,
  context: ExecutionContext,
  inputData?: any
): Promise<NodeExecutionResult> {
  const { type, data } = node;
  const config = data.config || {};

  console.log(`Executing node: ${node.id} (${type})`);

  // Log node execution start
  await supabase.from("workflow_executions").insert({
    workflow_id: context.workflowId,
    run_id: context.runId,
    node_id: node.id,
    node_type: type,
    status: "running",
    input_data: inputData,
    started_at: new Date().toISOString(),
  });

  try {
    let result: NodeExecutionResult;

    switch (type) {
      case "aptosTransfer":
        result = await executeAptosTransfer(config, context);
        break;

      case "conditionalLogic":
        result = await executeConditional(config, context, inputData);
        break;

      case "schedule":
        // Schedule nodes are handled by triggers, not execution
        result = { success: true, output: { message: "Schedule configured" } };
        break;

      case "webhookTrigger":
        // Webhook triggers are handled externally
        result = { success: true, output: { message: "Webhook configured" } };
        break;

      // Placeholder for future integrations
      case "priceTrigger":
        result = { success: true, output: { message: "Price trigger (not implemented)" } };
        break;

      case "decibelTrade":
        result = await executeDecibelTrade(config, context);
        break;

      case "photonReward":
        result = { success: true, output: { message: "Photon reward (not implemented)" } };
        break;

      case "qrPaymentTrigger":
        result = { success: true, output: { message: "QR payment (not implemented)" } };
        break;

      default:
        result = { success: false, error: `Unknown node type: ${type}` };
    }

    // Log node execution completion
    await supabase
      .from("workflow_executions")
      .update({
        status: result.success ? "completed" : "failed",
        output_data: result.output,
        error_message: result.error,
        transaction_hash: result.transactionHash,
        completed_at: new Date().toISOString(),
      })
      .eq("workflow_id", context.workflowId)
      .eq("run_id", context.runId)
      .eq("node_id", node.id);

    return result;
  } catch (error: any) {
    const errorMessage = error.message || "Node execution failed";

    // Log error
    await supabase
      .from("workflow_executions")
      .update({
        status: "failed",
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq("workflow_id", context.workflowId)
      .eq("run_id", context.runId)
      .eq("node_id", node.id);

    return { success: false, error: errorMessage };
  }
}

/**
 * Execute Decibel Trade node
 */
async function executeDecibelTrade(
  config: Record<string, any>,
  context: ExecutionContext
): Promise<NodeExecutionResult> {
  const { fromToken, toToken, amount, slippage = 0.5 } = config;

  if (!fromToken || !toToken || !amount) {
    return { success: false, error: "Trade configuration incomplete" };
  }

  try {
    // 1. Get Quote
    const quote = await getQuote({
      fromToken,
      toToken,
      amount,
      slippage,
    });

    if (!quote) {
      return { success: false, error: "Failed to get quote from Decibel" };
    }

    console.log(`Got quote: ${quote.price} ${toToken} per ${fromToken}`);

    // 2. Execute Swap
    const result = await executeSwap(quote.quoteId, "0x1"); // Using 0x1 as placeholder recipient

    if (result.success) {
      return {
        success: true,
        output: {
          ...quote,
          transactionHash: result.transactionHash,
          status: "completed",
        },
        transactionHash: result.transactionHash,
      };
    } else {
      return {
        success: false,
        error: result.error || "Trade execution failed",
      };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Trade failed" };
  }
}

/**
 * Execute Aptos Transfer node
 */
async function executeAptosTransfer(
  config: Record<string, any>,
  context: ExecutionContext
): Promise<NodeExecutionResult> {
  const { recipientAddress, amount, tokenType = "APT" } = config;

  if (!recipientAddress) {
    return { success: false, error: "Recipient address is required" };
  }

  if (!amount || amount <= 0) {
    return { success: false, error: "Valid amount is required" };
  }

  if (tokenType !== "APT") {
    return { success: false, error: "Only APT transfers are supported currently" };
  }

  // Execute transfer
  const result = await transferAPT(recipientAddress, amount);

  if (result.success) {
    return {
      success: true,
      output: {
        recipientAddress,
        amount,
        tokenType,
        transactionHash: result.transactionHash,
      },
      transactionHash: result.transactionHash,
    };
  } else {
    return {
      success: false,
      error: result.error || "Transfer failed",
    };
  }
}

/**
 * Execute Conditional Logic node
 */
async function executeConditional(
  config: Record<string, any>,
  context: ExecutionContext,
  inputData?: any
): Promise<NodeExecutionResult> {
  const { variable, operator, value } = config;

  if (!variable || !operator || value === undefined) {
    return { success: false, error: "Conditional configuration incomplete" };
  }

  // Get variable value from context or input
  const variableValue = context.variables[variable] || inputData?.[variable];

  if (variableValue === undefined) {
    return { success: false, error: `Variable "${variable}" not found` };
  }

  // Evaluate condition
  let conditionMet = false;
  switch (operator) {
    case ">":
      conditionMet = variableValue > value;
      break;
    case "<":
      conditionMet = variableValue < value;
      break;
    case ">=":
      conditionMet = variableValue >= value;
      break;
    case "<=":
      conditionMet = variableValue <= value;
      break;
    case "==":
      conditionMet = variableValue == value;
      break;
    case "!=":
      conditionMet = variableValue != value;
      break;
    default:
      return { success: false, error: `Unknown operator: ${operator}` };
  }

  return {
    success: true,
    output: {
      conditionMet,
      variable,
      variableValue,
      operator,
      value,
    },
  };
}

/**
 * Execute a complete workflow
 */
export async function executeWorkflow(
  workflowId: string,
  definition: WorkflowDefinition
): Promise<{ success: boolean; runId?: string; error?: string }> {
  try {
    // Create workflow run record
    const { data: runData, error: runError } = await supabase
      .from("workflow_runs")
      .insert({
        workflow_id: workflowId,
        status: "running",
        trigger_type: "manual",
      })
      .select()
      .single();

    if (runError || !runData) {
      console.error("Failed to create workflow run:", runError);
      return { success: false, error: "Failed to create workflow run" };
    }

    const runId = runData.id;
    console.log(`Created workflow run: ${runId}`);
    const context: ExecutionContext = {
      workflowId,
      runId,
      variables: {},
    };

    // Find trigger node (starting point)
    const triggerNode = definition.nodes.find((node) =>
      ["priceTrigger", "schedule", "webhookTrigger", "qrPaymentTrigger"].includes(node.type)
    );

    if (!triggerNode) {
      await supabase
        .from("workflow_runs")
        .update({ status: "failed", logs: "No trigger node found" })
        .eq("id", runId);
      return { success: false, error: "No trigger node found in workflow" };
    }

    // Execute nodes in sequence following the edges
    const executedNodes = new Set<string>();
    const nodeQueue = [triggerNode.id];
    let lastOutput: any = null;

    console.log(`Starting execution for run ${runId} with trigger ${triggerNode.id}`);

    while (nodeQueue.length > 0) {
      const currentNodeId = nodeQueue.shift()!;

      if (executedNodes.has(currentNodeId)) {
        continue;
      }

      const currentNode = definition.nodes.find((n) => n.id === currentNodeId);
      if (!currentNode) {
        console.error(`Node ${currentNodeId} not found in definition`);
        continue;
      }

      console.log(`Processing node: ${currentNode.id} (${currentNode.type})`);

      // Execute node
      const result = await executeNode(currentNode, context, lastOutput);
      console.log(`Node execution result:`, result);

      executedNodes.add(currentNodeId);

      if (!result.success) {
        // Workflow failed
        await supabase
          .from("workflow_runs")
          .update({
            status: "failed",
            logs: `Node ${currentNode.data.label} failed: ${result.error}`,
          })
          .eq("id", runId);
        return { success: false, runId, error: result.error };
      }

      lastOutput = result.output;

      // Store output in context variables
      if (result.output) {
        context.variables[currentNodeId] = result.output;
      }

      // Find next nodes
      const nextEdges = definition.edges.filter((edge) => edge.source === currentNodeId);

      // For conditional nodes, check which path to take
      if (currentNode.type === "conditionalLogic" && result.output?.conditionMet !== undefined) {
        const conditionMet = result.output.conditionMet;
        // In a real implementation, edges would have labels for true/false paths
        // For now, we'll execute all connected nodes
        nextEdges.forEach((edge) => {
          if (!executedNodes.has(edge.target)) {
            nodeQueue.push(edge.target);
          }
        });
      } else {
        // Add all next nodes to queue
        nextEdges.forEach((edge) => {
          if (!executedNodes.has(edge.target)) {
            nodeQueue.push(edge.target);
          }
        });
      }
    }

    // Mark workflow as completed
    await supabase
      .from("workflow_runs")
      .update({
        status: "completed",
        logs: `Workflow completed successfully. Executed ${executedNodes.size} nodes.`,
      })
      .eq("id", runId);

    return { success: true, runId };
  } catch (error: any) {
    console.error("Workflow execution error:", error);
    return { success: false, error: error.message || "Workflow execution failed" };
  }
}
