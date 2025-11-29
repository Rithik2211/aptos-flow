const { Ed25519PrivateKey, Account } = require("@aptos-labs/ts-sdk");
require("dotenv").config({ path: ".env" });

const privateKeyHex = process.env.APTOS_EXECUTION_PRIVATE_KEY;

if (!privateKeyHex) {
    console.error("APTOS_EXECUTION_PRIVATE_KEY not found in .env");
    process.exit(1);
}

try {
    const privateKey = new Ed25519PrivateKey(privateKeyHex);
    const account = Account.fromPrivateKey({ privateKey });

    console.log("\n=== Execution Wallet Info ===");
    console.log("Address:", account.accountAddress.toString());
    console.log("\nFund this address with testnet APT:");
    console.log("1. Go to: https://aptos.dev/en/network/faucet");
    console.log("2. Paste the address above");
    console.log("3. Click 'Fund Account'");
    console.log("\nOr use this direct link:");
    console.log(`https://aptos.dev/en/network/faucet?address=${account.accountAddress.toString()}`);
} catch (error) {
    console.error("Error:", error.message);
}
