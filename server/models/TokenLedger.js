const mongoose = require("mongoose");

const tokenLedgerSchema = new mongoose.Schema({
    ownerAddress: {
        type: String,
        required: true,
        unique: true
    },
    totalSupply: {
        type: Number,
        default: 1000000
    },
    deployedAt: {
        type: Date,
        default: Date.now
    }
});

const tokenTransactionSchema = new mongoose.Schema({
    ledgerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TokenLedger",
        required: true
    },
    eventType: {
        type: String,
        enum: ["Transfer", "TransferFrom", "Mint", "Burn", "Approval", "Deploy"],
        required: true
    },
    from: String,
    to: String,
    value: Number,
    spender: String,
    owner: String,
    status: {
        type: String,
        enum: ["success", "failed"],
        default: "success"
    },
    txHash: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = {
    TokenLedger: mongoose.model("TokenLedger", tokenLedgerSchema),
    TokenTransaction: mongoose.model("TokenTransaction", tokenTransactionSchema)
};
