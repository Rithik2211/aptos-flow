const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");
require("dotenv").config({ path: ".env" });

async function fundWallet() {
    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);

    const privateKeyHex = process.env.APTOS_EXECUTION_PRIVATE_KEY;
    if (!privateKeyHex) {
        console.error("APTOS_EXECUTION_PRIVATE_KEY not found");
        process.exit(1);
    }

    const privateKey = new Ed25519PrivateKey(privateKeyHex);
    const account = Account.fromPrivateKey({ privateKey });
    const address = account.accountAddress.toString();

    console.log("Funding wallet:", address);

    try {
        await aptos.fundAccount({
            accountAddress: address,
            amount: 100000000, // 1 APT
        });
        console.log("✅ Successfully funded with 1 APT!");

        // Check balance
        const balance = await aptos.getAccountAPTAmount({ accountAddress: address });
        console.log(`Current balance: ${balance / 100000000} APT`);
    } catch (error) {
        console.error("❌ Funding failed:", error.message);
        console.log("\nPlease fund manually:");
        console.log(`https://aptos.dev/en/network/faucet?address=${address}`);
    }
}

fundWallet();
