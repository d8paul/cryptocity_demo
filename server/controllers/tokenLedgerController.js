const { asyncErrorHandler } = require("../middlewares/helpers");
const ErrorHandler = require("../utils/errorHandler");
const { TokenLedger, TokenTransaction } = require("../models/TokenLedger");
const TokenLedgerContract = require("../contracts/TokenLedger");

const contractInstances = new Map();

exports.deployContract = asyncErrorHandler(async (req, res, next) => {
    const { ownerAddress, initialSupply = 1000000 } = req.body;

    if (!ownerAddress) {
        return next(new ErrorHandler("Owner address required", 400));
    }

    const existing = await TokenLedger.findOne({ ownerAddress });
    if (existing) {
        return next(new ErrorHandler("Contract already deployed for this address", 400));
    }

    const contract = new TokenLedgerContract(initialSupply);
    const deployResult = contract.deploy(ownerAddress);

    const ledger = new TokenLedger({
        ownerAddress,
        totalSupply: initialSupply
    });

    await ledger.save();
    contractInstances.set(ownerAddress, contract);

    res.status(201).json({
        success: true,
        data: {
            ledgerId: ledger._id,
            ...deployResult,
            totalSupply: contract.getTotalSupply()
        }
    });
});

exports.getBalance = asyncErrorHandler(async (req, res, next) => {
    const { address } = req.params;
    const { ownerAddress } = req.query;

    if (!ownerAddress || !address) {
        return next(new ErrorHandler("Owner and account address required", 400));
    }

    let contract = contractInstances.get(ownerAddress);
    if (!contract) {
        const ledger = await TokenLedger.findOne({ ownerAddress });
        if (!ledger) {
            return next(new ErrorHandler("Contract not found", 404));
        }
        contract = new TokenLedgerContract(ledger.totalSupply);
        contractInstances.set(ownerAddress, contract);
    }

    const balance = contract.getBalance(address);

    res.status(200).json({
        success: true,
        data: {
            address,
            balance,
            decimals: 18
        }
    });
});

exports.transfer = asyncErrorHandler(async (req, res, next) => {
    const { ownerAddress, from, to, value } = req.body;

    if (!ownerAddress || !from || !to || !value) {
        return next(new ErrorHandler("Missing required fields", 400));
    }

    let contract = contractInstances.get(ownerAddress);
    if (!contract) {
        const ledger = await TokenLedger.findOne({ ownerAddress });
        if (!ledger) {
            return next(new ErrorHandler("Contract not found", 404));
        }
        contract = new TokenLedgerContract(ledger.totalSupply);
        contractInstances.set(ownerAddress, contract);
    }

    const result = contract.transfer(from, to, value);

    if (result.success) {
        const ledger = await TokenLedger.findOne({ ownerAddress });
        const transaction = new TokenTransaction({
            ledgerId: ledger._id,
            eventType: "Transfer",
            from,
            to,
            value
        });
        await transaction.save();
    }

    res.status(result.success ? 200 : 400).json({
        success: result.success,
        data: result
    });
});

exports.mint = asyncErrorHandler(async (req, res, next) => {
    const { ownerAddress, to, value } = req.body;

    if (!ownerAddress || !to || !value) {
        return next(new ErrorHandler("Missing required fields", 400));
    }

    let contract = contractInstances.get(ownerAddress);
    if (!contract) {
        const ledger = await TokenLedger.findOne({ ownerAddress });
        if (!ledger) {
            return next(new ErrorHandler("Contract not found", 404));
        }
        contract = new TokenLedgerContract(ledger.totalSupply);
        contractInstances.set(ownerAddress, contract);
    }

    const result = contract.mint(to, value);

    if (result.success) {
        const ledger = await TokenLedger.findOne({ ownerAddress });
        ledger.totalSupply = contract.getTotalSupply();
        await ledger.save();

        const transaction = new TokenTransaction({
            ledgerId: ledger._id,
            eventType: "Mint",
            to,
            value
        });
        await transaction.save();
    }

    res.status(result.success ? 200 : 400).json({
        success: result.success,
        data: result
    });
});

exports.burn = asyncErrorHandler(async (req, res, next) => {
    const { ownerAddress, from, value } = req.body;

    if (!ownerAddress || !from || !value) {
        return next(new ErrorHandler("Missing required fields", 400));
    }

    let contract = contractInstances.get(ownerAddress);
    if (!contract) {
        const ledger = await TokenLedger.findOne({ ownerAddress });
        if (!ledger) {
            return next(new ErrorHandler("Contract not found", 404));
        }
        contract = new TokenLedgerContract(ledger.totalSupply);
        contractInstances.set(ownerAddress, contract);
    }

    const result = contract.burn(from, value);

    if (result.success) {
        const ledger = await TokenLedger.findOne({ ownerAddress });
        ledger.totalSupply = contract.getTotalSupply();
        await ledger.save();

        const transaction = new TokenTransaction({
            ledgerId: ledger._id,
            eventType: "Burn",
            from,
            value
        });
        await transaction.save();
    }

    res.status(result.success ? 200 : 400).json({
        success: result.success,
        data: result
    });
});

exports.approve = asyncErrorHandler(async (req, res, next) => {
    const { ownerAddress, owner, spender, value } = req.body;

    if (!ownerAddress || !owner || !spender || value === undefined) {
        return next(new ErrorHandler("Missing required fields", 400));
    }

    let contract = contractInstances.get(ownerAddress);
    if (!contract) {
        const ledger = await TokenLedger.findOne({ ownerAddress });
        if (!ledger) {
            return next(new ErrorHandler("Contract not found", 404));
        }
        contract = new TokenLedgerContract(ledger.totalSupply);
        contractInstances.set(ownerAddress, contract);
    }

    const result = contract.approve(owner, spender, value);

    if (result.success) {
        const ledger = await TokenLedger.findOne({ ownerAddress });
        const transaction = new TokenTransaction({
            ledgerId: ledger._id,
            eventType: "Approval",
            owner,
            spender,
            value
        });
        await transaction.save();
    }

    res.status(result.success ? 200 : 400).json({
        success: result.success,
        data: result
    });
});

exports.getTransactionHistory = asyncErrorHandler(async (req, res, next) => {
    const { ledgerId } = req.params;

    const transactions = await TokenTransaction.find({ ledgerId }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
    });
});

exports.getLedgerInfo = asyncErrorHandler(async (req, res, next) => {
    const { ownerAddress } = req.params;

    const ledger = await TokenLedger.findOne({ ownerAddress });
    if (!ledger) {
        return next(new ErrorHandler("Contract not found", 404));
    }

    const transactionCount = await TokenTransaction.countDocuments({ ledgerId: ledger._id });

    res.status(200).json({
        success: true,
        data: {
            ledgerId: ledger._id,
            ownerAddress: ledger.ownerAddress,
            totalSupply: ledger.totalSupply,
            tokenName: "Ledger Token",
            tokenSymbol: "LDG",
            decimals: 18,
            deployedAt: ledger.deployedAt,
            transactionCount
        }
    });
});

exports.getAllLedgers = asyncErrorHandler(async (req, res, next) => {
    const ledgers = await TokenLedger.find();

    res.status(200).json({
        success: true,
        count: ledgers.length,
        data: ledgers
    });
});
