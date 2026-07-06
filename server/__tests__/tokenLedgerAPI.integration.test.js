const request = require("supertest");
const app = require("../app");

describe("Token Ledger API Integration Tests", () => {
    const ownerAddress = "0x1111111111111111111111111111111111111111";
    const userAddress = "0x2222222222222222222222222222222222222222";
    let ledgerId;

    describe("POST /api/tokenledger/deploy", () => {
        test("should deploy a new token ledger", async () => {
            const res = await request(app)
                .post("/api/tokenledger/deploy")
                .send({
                    ownerAddress,
                    initialSupply: 1000000
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.owner).toBe(ownerAddress);
            ledgerId = res.body.data.ledgerId;
        });

        test("should fail deploying with duplicate address", async () => {
            await request(app)
                .post("/api/tokenledger/deploy")
                .send({ ownerAddress, initialSupply: 500000 });

            const res = await request(app)
                .post("/api/tokenledger/deploy")
                .send({ ownerAddress, initialSupply: 500000 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe("GET /api/tokenledger/balance/:address", () => {
        test("should get balance for deployed contract", async () => {
            await request(app)
                .post("/api/tokenledger/deploy")
                .send({ ownerAddress: ownerAddress + "1", initialSupply: 500000 });

            const res = await request(app)
                .get(`/api/tokenledger/balance/${ownerAddress}1`)
                .query({ ownerAddress: ownerAddress + "1" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe("POST /api/tokenledger/transfer", () => {
        test("should transfer tokens", async () => {
            const newOwner = ownerAddress + "2";
            await request(app)
                .post("/api/tokenledger/deploy")
                .send({ ownerAddress: newOwner, initialSupply: 1000 });

            const res = await request(app)
                .post("/api/tokenledger/transfer")
                .send({
                    ownerAddress: newOwner,
                    from: newOwner,
                    to: userAddress,
                    value: 100000000000000000
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test("should fail transfer with missing fields", async () => {
            const res = await request(app)
                .post("/api/tokenledger/transfer")
                .send({
                    ownerAddress,
                    from: ownerAddress
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe("POST /api/tokenledger/mint", () => {
        test("should mint tokens", async () => {
            const newOwner = ownerAddress + "3";
            await request(app)
                .post("/api/tokenledger/deploy")
                .send({ ownerAddress: newOwner, initialSupply: 500000 });

            const res = await request(app)
                .post("/api/tokenledger/mint")
                .send({
                    ownerAddress: newOwner,
                    to: userAddress,
                    value: 500000000000000000
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe("POST /api/tokenledger/burn", () => {
        test("should burn tokens", async () => {
            const newOwner = ownerAddress + "4";
            await request(app)
                .post("/api/tokenledger/deploy")
                .send({ ownerAddress: newOwner, initialSupply: 1000000 });

            await request(app)
                .post("/api/tokenledger/transfer")
                .send({
                    ownerAddress: newOwner,
                    from: newOwner,
                    to: userAddress,
                    value: 1000000000000000000
                });

            const res = await request(app)
                .post("/api/tokenledger/burn")
                .send({
                    ownerAddress: newOwner,
                    from: newOwner,
                    value: 1000000000000000000
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe("POST /api/tokenledger/approve", () => {
        test("should approve tokens", async () => {
            const newOwner = ownerAddress + "5";
            await request(app)
                .post("/api/tokenledger/deploy")
                .send({ ownerAddress: newOwner, initialSupply: 1000000 });

            const res = await request(app)
                .post("/api/tokenledger/approve")
                .send({
                    ownerAddress: newOwner,
                    owner: newOwner,
                    spender: userAddress,
                    value: 5000000000000000000
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe("GET /api/tokenledger/all", () => {
        test("should get all ledgers", async () => {
            const res = await request(app)
                .get("/api/tokenledger/all");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
});
