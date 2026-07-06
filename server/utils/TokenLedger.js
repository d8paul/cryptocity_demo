class TokenLedgerContract {
    
    constructor(initialSupply = 1000000) {
        this.tokenName   = "Ledger Token";
        this.tokenSymbol = "XLDG";
        this.decimals    = 18;
        this.totalSupply = initialSupply * Math.pow(10, this.decimals);
        this.balanceOf   = {};
        this.allowance   = {};
        this.events      = [];
        this.owner       = null;
    }

    deploy(ownerAddress) {
        this.owner = ownerAddress;
        this.balanceOf[ownerAddress] = this.totalSupply;
        this.events.push({
            event: "Deploy",
            from: null,
            to: ownerAddress,
            value: this.totalSupply,
            timestamp: new Date()
        });
        return { success: true, message: "Contract deployed", owner: ownerAddress };
    }

    transfer(from, to, value) {
        if (!this.balanceOf[from]) {
            return { success: false, error: "Sender has no balance" };
        }
        if (this.balanceOf[from] < value) {
            return { success: false, error: "Insufficient balance" };
        }
        if (!to) {
            return { success: false, error: "Invalid recipient address" };
        }

        this.balanceOf[from] -= value;
        this.balanceOf[to] = (this.balanceOf[to] || 0) + value;

        this.events.push({
            event: "Transfer",
            from,
            to,
            value,
            timestamp: new Date()
        });

        return { success: true, message: "Transfer completed", from, to, value };
    }

    transferFrom(from, to, spender, value) {
        if (!this.allowance[from] || !this.allowance[from][spender] || this.allowance[from][spender] < value) {
            return { success: false, error: "Allowance exceeded or not set" };
        }

        const result = this.transfer(from, to, value);
        if (result.success) {
            this.allowance[from][spender] -= value;
            result.event = "TransferFrom";
        }
        return result;
    }

    approve(owner, spender, value) {
        if (!owner || !spender) {
            return { success: false, error: "Invalid owner or spender" };
        }

        if (!this.allowance[owner]) {
            this.allowance[owner] = {};
        }
        this.allowance[owner][spender] = value;

        this.events.push({
            event: "Approval",
            owner,
            spender,
            value,
            timestamp: new Date()
        });

        return { success: true, message: "Approval granted", owner, spender, value };
    }

    mint(to, value) {
        if (!to) {
            return { success: false, error: "Invalid recipient address" };
        }

        this.totalSupply += value;
        this.balanceOf[to] = (this.balanceOf[to] || 0) + value;

        this.events.push({
            event: "Mint",
            to,
            value,
            timestamp: new Date()
        });

        return { success: true, message: "Tokens minted", to, value };
    }

    burn(from, value) {
        if (!this.balanceOf[from] || this.balanceOf[from] < value) {
            return { success: false, error: "Insufficient balance to burn" };
        }

        this.balanceOf[from] -= value;
        this.totalSupply -= value;

        this.events.push({
            event: "Burn",
            from,
            value,
            timestamp: new Date()
        });

        return { success: true, message: "Tokens burned", from, value };
    }

    getBalance(address) {
        return this.balanceOf[address] || 0;
    }

    getAllBalances() {
        return { ...this.balanceOf };
    }

    getTotalSupply() {
        return this.totalSupply;
    }

    getEvents() {
        return [...this.events];
    }

    getEventsByAddress(address) {
        return this.events.filter(e => e.from === address || e.to === address);
    }
}

module.exports = TokenLedgerContract;
