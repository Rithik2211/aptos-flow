import { aptos, getExecutionAccount } from "./aptos";

const DECIBEL_API_URL = "https://api.decibel.fi/v1"; // Placeholder URL
const DECIBEL_API_KEY = process.env.DECIBEL_API_KEY || "";

export interface QuoteRequest {
    fromToken: string;
    toToken: string;
    amount: number;
    slippage?: number;
}

export interface QuoteResponse {
    quoteId: string;
    fromToken: string;
    toToken: string;
    fromAmount: number;
    toAmount: number;
    price: number;
    estimatedGas: number;
    route: any[];
}

export interface TradeResult {
    success: boolean;
    transactionHash?: string;
    error?: string;
}

/**
 * Get a quote for a swap
 */
export async function getQuote(params: QuoteRequest): Promise<QuoteResponse | null> {
    try {
        // In a real implementation, this would call the Decibel API
        // For now, we'll mock the response for testing
        console.log("Fetching quote from Decibel:", params);

        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            quoteId: `quote_${Date.now()}`,
            fromToken: params.fromToken,
            toToken: params.toToken,
            fromAmount: params.amount,
            toAmount: params.amount * 10.5, // Mock price
            price: 10.5,
            estimatedGas: 0.001,
            route: [],
        };
    } catch (error) {
        console.error("Error fetching quote:", error);
        return null;
    }
}

/**
 * Execute a swap transaction with retry logic for rate limits
 */
export async function executeSwap(
    quoteId: string,
    userAddress: string
): Promise<TradeResult> {
    // Mock mode for testing (bypasses Aptos API to avoid rate limits)
    if (process.env.MOCK_MODE === "true") {
        console.log("🧪 MOCK MODE: Simulating swap execution...");
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        const mockHash = `0x${Math.random().toString(16).substring(2, 66)}`;
        console.log(`✅ MOCK Transaction successful: ${mockHash}`);
        return {
            success: true,
            transactionHash: mockHash,
        };
    }

    const maxRetries = 5; // Increased from 3
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const account = getExecutionAccount();

            console.log(`Executing swap for quote ${quoteId} with account ${account.accountAddress} (attempt ${attempt}/${maxRetries})`);

            // Build and submit transaction
            const transaction = await aptos.transaction.build.simple({
                sender: account.accountAddress,
                data: {
                    function: "0x1::coin::transfer",
                    typeArguments: ["0x1::aptos_coin::AptosCoin"],
                    functionArguments: [userAddress, 100], // Tiny amount to simulate gas
                },
            });

            const committedTxn = await aptos.signAndSubmitTransaction({
                signer: account,
                transaction,
            });

            const executedTransaction = await aptos.waitForTransaction({
                transactionHash: committedTxn.hash,
            });

            if (executedTransaction.success) {
                console.log(`✅ Transaction successful: ${committedTxn.hash}`);
                return {
                    success: true,
                    transactionHash: committedTxn.hash,
                };
            } else {
                return {
                    success: false,
                    error: "Transaction failed on-chain",
                };
            }
        } catch (error: any) {
            lastError = error;

            // Check if it's a rate limit error
            const isRateLimit = error.message?.includes("429") ||
                error.message?.includes("Too Many Requests") ||
                error.message?.includes("rate limit");

            if (isRateLimit && attempt < maxRetries) {
                // Longer exponential backoff: 10s, 30s, 60s, 120s, 240s
                const waitTime = Math.pow(3, attempt) * 3000;
                console.log(`⏳ Rate limit hit. Waiting ${waitTime / 1000}s before retry ${attempt + 1}/${maxRetries}...`);
                console.log(`💡 Tip: The Aptos API has a 5-minute rate limit window. Waiting helps avoid hitting it again.`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue; // Retry
            }

            // If not rate limit or max retries reached, fail
            console.error("Swap execution error:", error);
            break;
        }
    }

    return {
        success: false,
        error: lastError?.message || "Swap failed after retries",
    };
}
