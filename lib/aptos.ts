import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

const network = (process.env.APTOS_NETWORK as Network) || Network.TESTNET;

export const aptosConfig = new AptosConfig({ network });
export const aptos = new Aptos(aptosConfig);

/**
 * Execution wallet for automated workflows
 * In production, this should be stored securely (e.g., AWS Secrets Manager, HashiCorp Vault)
 * For demo/testnet, we'll generate a new wallet if not provided
 */
let executionAccount: Account | null = null;

/**
 * Get or create the execution account
 * This account will sign transactions for automated workflows
 */
export function getExecutionAccount(): Account {
    if (executionAccount) {
        return executionAccount;
    }

    // Check if private key is provided in environment
    const privateKeyHex = process.env.APTOS_EXECUTION_PRIVATE_KEY;

    if (privateKeyHex) {
        // Use provided private key
        const privateKey = new Ed25519PrivateKey(privateKeyHex);
        executionAccount = Account.fromPrivateKey({ privateKey });
    } else {
        // Generate a new account for demo purposes
        // WARNING: This will create a new account on every server restart
        executionAccount = Account.generate();
        console.warn("⚠️  No APTOS_EXECUTION_PRIVATE_KEY found. Generated new account:", executionAccount.accountAddress.toString());
        console.warn("⚠️  Add this to your .env file to persist the account:");
        console.warn(`APTOS_EXECUTION_PRIVATE_KEY=${executionAccount.privateKey.toString()}`);
    }

    return executionAccount;
}

/**
 * Get account balance
 */
export async function getAccountBalance(address: string): Promise<number> {
    try {
        const resources = await aptos.getAccountResources({ accountAddress: address });
        const coinResource = resources.find((r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");

        if (coinResource && "coin" in coinResource.data) {
            const data = coinResource.data as { coin: { value: string } };
            return parseInt(data.coin.value) / 100000000; // Convert from Octas to APT
        }
        return 0;
    } catch (error) {
        console.error("Error getting balance:", error);
        return 0;
    }
}

/**
 * Transfer APT to a recipient
 */
export async function transferAPT(
    recipientAddress: string,
    amount: number
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
        const account = getExecutionAccount();

        // Convert APT to Octas (1 APT = 100,000,000 Octas)
        const amountInOctas = Math.floor(amount * 100000000);

        // Build transaction
        const transaction = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: {
                function: "0x1::coin::transfer",
                typeArguments: ["0x1::aptos_coin::AptosCoin"],
                functionArguments: [recipientAddress, amountInOctas],
            },
        });

        // Sign and submit transaction
        const committedTxn = await aptos.signAndSubmitTransaction({
            signer: account,
            transaction,
        });

        // Wait for transaction to be confirmed
        const executedTransaction = await aptos.waitForTransaction({
            transactionHash: committedTxn.hash,
        });

        return {
            success: executedTransaction.success,
            transactionHash: committedTxn.hash,
        };
    } catch (error: any) {
        console.error("Transfer error:", error);
        return {
            success: false,
            error: error.message || "Transfer failed",
        };
    }
}

/**
 * Fund the execution account from faucet (testnet only)
 */
export async function fundExecutionAccount(): Promise<boolean> {
    try {
        if (network !== Network.TESTNET && network !== Network.DEVNET) {
            console.error("Faucet only available on testnet/devnet");
            return false;
        }

        const account = getExecutionAccount();
        await aptos.fundAccount({
            accountAddress: account.accountAddress,
            amount: 100000000, // 1 APT
        });

        console.log("✅ Funded execution account:", account.accountAddress.toString());
        return true;
    } catch (error) {
        console.error("Error funding account:", error);
        return false;
    }
}

/**
 * Get transaction details
 */
export async function getTransaction(txHash: string) {
    try {
        return await aptos.getTransactionByHash({ transactionHash: txHash });
    } catch (error) {
        console.error("Error getting transaction:", error);
        return null;
    }
}
