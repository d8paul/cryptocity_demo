const TokenLedgerContract = require("../contracts/TokenLedger");

describe("TokenLedger Contract", () => {
    let contract;
    const ownerAddress = "0x1111111111111111111111111111111111111111";
    const userAddress = "0x2222222222222222222222222222222222222222";
    const recipientAddress = "0x3333333333333333333333333333333333333333";

    beforeEach(() => {
        contract = new TokenLedgerContract(1000000);
        contract.deploy(ownerAddress);
    });

    describe("Deploy", () => {
        test("should deploy contract with initial supply", () => {
            expect(contract.tokenName).toBe("Ledger Token");
            expect(contract.tokenSymbol).toBe("LDG");
            expect(contract.owner).toBe(ownerAddress);
            expect(contract.getBalance(ownerAddress)).toBe(1000000 * Math.pow(10, 18));
        });
    });

    describe("Transfer", () => {
        test("should transfer tokens between addresses", () => {
            const amount = 100 * Math.pow(10, 18);
            const result = contract.transfer(ownerAddress, userAddress, amount);

            expect(result.success).toBe(true);
            expect(contract.getBalance(userAddress)).toBe(amount);
            expect(contract.getBalance(ownerAddress)).toBe(1000000 * Math.pow(10, 18) - amount);
        });

        test("should fail transfer with insufficient balance", () => {
            const amount = 2000000 * Math.pow(10, 18);
            const result = contract.transfer(ownerAddress, userAddress, amount);

            expect(result.success).toBe(false);
            expect(result.error).toBe("Insufficient balance");
        });

        test("should fail transfer to invalid address", () => {
            const result = contract.transfer(ownerAddress, null, 100);

            expect(result.success).toBe(false);
            expect(result.error).toBe("Invalid recipient address");
        });

        test("should record transfer events", () => {
            const amount = 50 * Math.pow(10, 18);
            contract.transfer(ownerAddress, userAddress, amount);

            const events = contract.getEventsByAddress(userAddress);
            expect(events.length).toBeGreaterThan(0);
            expect(events[events.length - 1].event).toBe("Transfer");
        });
    });

    describe("Mint", () => {
        test("should mint new tokens", () => {
            const initialSupply = contract.getTotalSupply();
            const mintAmount = 500 * Math.pow(10, 18);
            const result = contract.mint(userAddress, mintAmount);

            expect(result.success).toBe(true);
            expect(contract.getBalance(userAddress)).toBe(mintAmount);
            expect(contract.getTotalSupply()).toBe(initialSupply + mintAmount);
        });

        test("should fail mint to invalid address", () => {
            const result = contract.mint(null, 100);

            expect(result.success).toBe(false);
            expect(result.error).toBe("Invalid recipient address");
        });
    });

    describe("Burn", () => {
        test("should burn tokens", () => {
            const transferAmount = 100 * Math.pow(10, 18);
            contract.transfer(ownerAddress, userAddress, transferAmount);

            const burnAmount = 50 * Math.pow(10, 18);
            const initialSupply = contract.getTotalSupply();
            const result = contract.burn(userAddress, burnAmount);

            expect(result.success).toBe(true);
            expect(contract.getBalance(userAddress)).toBe(transferAmount - burnAmount);
            expect(contract.getTotalSupply()).toBe(initialSupply - burnAmount);
        });

        test("should fail burn with insufficient balance", () => {
            const result = contract.burn(userAddress, 100);

            expect(result.success).toBe(false);
            expect(result.error).toBe("Insufficient balance to burn");
        });
    });

    describe("Approve and TransferFrom", () => {
        test("should approve tokens", () => {
            const approveAmount = 500 * Math.pow(10, 18);
            const result = contract.approve(ownerAddress, userAddress, approveAmount);

            expect(result.success).toBe(true);
        });

        test("should transfer approved tokens", () => {
            const transferAmount = 100 * Math.pow(10, 18);
            contract.transfer(ownerAddress, userAddress, transferAmount);

            const approveAmount = 50 * Math.pow(10, 18);
            contract.approve(userAddress, recipientAddress, approveAmount);

            const result = contract.transferFrom(userAddress, recipientAddress, recipientAddress, approveAmount);

            expect(result.success).toBe(true);
            expect(contract.getBalance(recipientAddress)).toBe(approveAmount);
        });

        test("should fail transferFrom with insufficient allowance", () => {
            const result = contract.transferFrom(ownerAddress, userAddress, recipientAddress, 1000);

            expect(result.success).toBe(false);
        });
    });

    describe("Balance and Events", () => {
        test("should get all balances", () => {
            const amount = 100 * Math.pow(10, 18);
            contract.transfer(ownerAddress, userAddress, amount);

            const balances = contract.getAllBalances();
            expect(balances[ownerAddress]).toBeDefined();
            expect(balances[userAddress]).toBe(amount);
        });

        test("should retrieve events by address", () => {
            const amount = 50 * Math.pow(10, 18);
            contract.transfer(ownerAddress, userAddress, amount);
            contract.mint(userAddress, 100 * Math.pow(10, 18));

            const events = contract.getEventsByAddress(userAddress);
            expect(events.length).toBeGreaterThan(0);
        });

        test("should retrieve all events", () => {
            contract.transfer(ownerAddress, userAddress, 100);
            contract.mint(recipientAddress, 50);
            contract.burn(ownerAddress, 25);

            const events = contract.getEvents();
            expect(events.length).toBeGreaterThan(0);
        });
    });
});
