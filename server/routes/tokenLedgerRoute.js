const express = require("express");
const router = express.Router();
const {
    deployContract,
    getBalance,
    transfer,
    mint,
    burn,
    approve,
    getTransactionHistory,
    getLedgerInfo,
    getAllLedgers
} = require("../controllers/tokenLedgerController");

router.route("/deploy").post(deployContract);
router.route("/balance/:address").get(getBalance);
router.route("/transfer").post(transfer);
router.route("/mint").post(mint);
router.route("/burn").post(burn);
router.route("/approve").post(approve);
router.route("/transactions/:ledgerId").get(getTransactionHistory);
router.route("/info/:ownerAddress").get(getLedgerInfo);
router.route("/all").get(getAllLedgers);

module.exports = router;
