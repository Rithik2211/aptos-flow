const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");
require("dotenv").config({ path: ".env" });

async function checkBalance() {
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

    console.log("Execution Wallet Address:", address);

    try {
        const balance = await aptos.getAccountAPTAmount({ accountAddress: address });
        console.log(`Balance: ${balance / 100000000} APT`);

        if (balance === 0) {
            console.log("\n❌ Wallet has 0 APT - needs funding!");
            console.log(`Fund at: https://aptos.dev/en/network/faucet?address=${address}`);
        } else {
            console.log("\n✅ Wallet is funded and ready!");
        }
    } catch (error) {
        console.error("Error checking balance:", error.message);
        if (error.message.includes("not found")) {
            console.log("\n❌ Account doesn't exist yet - needs to be funded to initialize!");
            console.log(`Fund at: https://aptos.dev/en/network/faucet?address=${address}`);
        }
    }
}

checkBalance();
