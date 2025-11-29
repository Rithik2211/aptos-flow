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
    const maxRetries = 3;
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
                const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
                console.log(`⏳ Rate limit hit. Waiting ${waitTime / 1000}s before retry ${attempt + 1}/${maxRetries}...`);
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
