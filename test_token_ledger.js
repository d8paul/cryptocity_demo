const TokenLedgerContract = require("./server/contracts/TokenLedger");

const ownerAddress = "0x1111111111111111111111111111111111111111";
const userAddress = "0x2222222222222222222222222222222222222222";
const recipientAddress = "0x3333333333333333333333333333333333333333";

function example() {
    const contract = new TokenLedgerContract(1000000);
    console.log("\n=== Token Ledger Contract Example ===\n");

    const deployResult = contract.deploy(ownerAddress);
    console.log("1. Deploy Contract:");
    console.log(`   Owner: ${ownerAddress}`);
    console.log(`   Total Supply: ${contract.getTotalSupply()}\n`);

    const transferResult = contract.transfer(ownerAddress, userAddress, 100 * Math.pow(10, 18));
    console.log("2. Transfer 100 tokens to user:");
    console.log(`   From: ${ownerAddress}`);
    console.log(`   To: ${userAddress}`);
    console.log(`   Success: ${transferResult.success}\n`);

    const mintResult = contract.mint(recipientAddress, 500 * Math.pow(10, 18));
    console.log("3. Mint 500 tokens for recipient:");
    console.log(`   To: ${recipientAddress}`);
    console.log(`   Success: ${mintResult.success}`);
    console.log(`   New Total Supply: ${contract.getTotalSupply()}\n`);

    const approveResult = contract.approve(userAddress, recipientAddress, 50 * Math.pow(10, 18));
    console.log("4. Approve 50 tokens for recipient:");
    console.log(`   Owner: ${userAddress}`);
    console.log(`   Spender: ${recipientAddress}`);
    console.log(`   Success: ${approveResult.success}\n`);

    const balances = contract.getAllBalances();
    console.log("5. All Balances:");
    for (const [address, balance] of Object.entries(balances)) {
        console.log(`   ${address}: ${balance / Math.pow(10, 18)} XLDG`);
    }

    const events = contract.getEvents();
    console.log(`\n6. Total Events Recorded: ${events.length}`);
    console.log("   Recent Events:");
    events.slice(-3).forEach((event, i) => {
        console.log(`     ${i + 1}. ${event.event} - ${new Date(event.timestamp).toLocaleTimeString()}`);
    });

    const userEvents = contract.getEventsByAddress(userAddress);
    console.log(`\n7. Events for ${userAddress}:`);
    console.log(`   Count: ${userEvents.length}`);
    userEvents.forEach((event, i) => {
        console.log(`     ${i + 1}. ${event.event}`);
    });

    const burnResult = contract.burn(userAddress, 25 * Math.pow(10, 18));
    console.log(`\n8. Burn 25 tokens:`);
    console.log(`   From: ${userAddress}`);
    console.log(`   Success: ${burnResult.success}`);
    console.log(`   New Total Supply: ${contract.getTotalSupply()}\n`);
}

if (require.main === module) {
    example();
}

module.exports = { example };
