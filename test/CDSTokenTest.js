var CDSToken = artifacts.require("./CDSToken.sol")

contract('CDSToken', async(accounts) => {
    it("test create", async() => {
        let instance = await CDSToken.deployed()
        let balance = await instance.balanceOf.call(accounts[0])
        assert.equal(3 * (10 ** 8) * (10 ** 18), balance.valueOf(), "0.3B wasn't in the first account");
        
    })

    it("test transfer", async() => {
        let owner = accounts[0]
        let user1 = accounts[1]
        let user2 = accounts[2]

        let instance = await CDSToken.deployed()
        let ownerBalance = await instance.balanceOf.call(owner)
        let user1Balance = await instance.balanceOf.call(user1)
        let user2Balance = await instance.balanceOf.call(user2)

        let amount = 1000

        await instance.transfer(user1, amount, {from: owner})
        await instance.transfer(user2, amount, {from: owner})

        let user1BalanceEnd = await instance.balanceOf.call(user1)
        let user2BalanceEnd = await instance.balanceOf.call(user2)
        let ownerBalanceEnd = await instance.balanceOf.call(owner)
        
        assert.equal(user1Balance.toNumber(), 0, "User 1 balance wasn't correctly")
        assert.equal(user2Balance.toNumber(), 0, "User 2 balance wasn't correctly")
        assert.equal(user1BalanceEnd.toNumber(), amount, "User 1 balance wasn't correctly")
        assert.equal(user2BalanceEnd.toNumber(), amount, "User 2 balance wasn't correctly")
        assert.equal(ownerBalanceEnd.toNumber(), ownerBalance.toNumber() - amount, "User 2 balance wasn't correctly")
    })

    it("test transfer overflow", async() => {
        let owner = accounts[0]
        let user3 = accounts[3]

        let instance = await CDSToken.deployed()

        let ownerBalance = await instance.balanceOf.call(owner)
        let user3Balance = await instance.balanceOf.call(user3)
        assert.equal(user3Balance.toNumber(), 0, "User 3 balance wasn't correctly")

        try {
            await instance.transfer(user3, 2 ** 256 , {from: owner})
            assert.equal(1, 0, "test fail, sent coin overflow")
        } catch(e) {
            //ignore it. expected
        }

        try {
            await instance.transfer(user3, 2 ** 256 - 1 , {from: owner})
            assert.equal(1, 0, "test fail, sent coin overflow")
        } catch(e) {
            //ignore it. expected
        }

        try {
            await instance.transfer(owner, -1, {from: user3})
            assert.equal(1, 0, "test fail, sent coin overflow")
        } catch(e) {
            //ignore it. expected
        }

        try {
            await instance.transfer(owner, 1, {from: user3})
            assert.equal(1, 0, "test fail, not enough money")
        } catch(e) {
            //ignore it. expected
        }
    })

    it("test approve and transfer from", async() => {
        let owner = accounts[0]
        let user1 = accounts[1]
        let user2 = accounts[2]
        let user5 = accounts[5]

        let instance = await CDSToken.deployed()

        let ownerBalance = await instance.balanceOf.call(owner)
        let user1Balance = await instance.balanceOf.call(user1)


        try {
            await instance.transferFrom(user1, user5, 500)
            assert.equal(1, 0, "test fail, transfer from should not happen")
        } catch(e) {

        }
        
        await instance.approve(user5, 500, {from: user1})
        let user5Allowed = await instance.allowance.call(user1, user5)
        assert.equal(user5Allowed.toNumber(), 500, "test allowed fail")
        // todo test transfer from

        try {
            await instance.transferFrom(user1, user5, -1, {from: user1})
            assert.equal(1, 0, "test fail, transfer from should not happen")
        } catch(e) {
            // ignore
        }

        try {
            await instance.transferFrom(user1, user5, 501, {from: user1})
            assert.equal(1, 0, "test fail, transfer from should not happen")
        } catch(e) {
            // ignore
        }

        try {
            await instance.transferFrom(user1, user5, 501, {from: user2})
            assert.equal(1, 0, "test fail, transfer from should not happen")
        } catch(e) {
            // ignore
        }

        try {
            await instance.transferFrom(user1, user5, 2 ** 32, {from: user1})
            assert.equal(1, 0, "test fail, transfer from should not happen")
        } catch(e) {
            // ignore
        }

        try {
            await instance.transferFrom(user5, user1, 2 ** 32, {from: user5})
            assert.equal(1, 0, "test fail, transfer from should not happen")
        } catch(e) {
            // ignore
        }        
    })

    it("test send ether to contract", async() => {
        let owner = accounts[0]
        let user1 = accounts[1]
        let instance = await CDSToken.deployed()
        try {
            let result = await instance.sendTransaction({value: 3 * 10**18, from: owner})
            assert.equal(1, 0, "test fail, owner's ether sent to contract")
        } catch(e) {
            //ignore it. expected
        }

        try {
            let result = await instance.sendTransaction({value: 3 * 10**18, from: user1})
            assert.equal(1, 0, "test fail, user1's ether sent to contract")
        } catch(e) {
            //ignore it. expected
        }
    })

    it("test freeze & unfreeze", async() => {
        let owner = accounts[0]
        let user1 = accounts[1]
        let user2 = accounts[2]
        let instance = await CDSToken.deployed()

        let user1Balance = await instance.balanceOf.call(user1)
        assert.equal(user1Balance.toNumber(), 1000, "User 1 balance wasn't correctly")

        await instance.freeze(user1, 500)

        let user1BalanceAfterFreeze = await instance.balanceOf.call(user1)
        assert.equal(user1BalanceAfterFreeze.toNumber(), 500, "User 1 balance wasn't correctly")

        let frozenOfUser1 = await instance.frozenOf.call(user1)
        assert.equal(frozenOfUser1.toNumber(), 500, "User 1 frozen balance wasn't correctly")

        await instance.unfreeze(user1, 250)
        let user1BalanceAfterUnfreezePart = await instance.balanceOf.call(user1)
        assert.equal(user1BalanceAfterUnfreezePart.toNumber(), user1BalanceAfterFreeze.toNumber() + 250, "User 1 balance wasn't correctly")

        let frozenOfUser1AfterUnfreezePart = await instance.frozenOf.call(user1)
        assert.equal(frozenOfUser1AfterUnfreezePart.toNumber(), 500 - 250, "User 1 frozen balance wasn't correctly")

        try {
            await instance.freeze(user2, 500, {from: user1})
            assert.equal(1, 0, "test fail, user1 is not owner")
        } catch(e) {
            // ignore , this is right
        }

        try {
            await instance.freeze(user2, 1001, {from: owner})
            assert.equal(1, 0, "test fail, user2 not enough money")
        } catch(e) {
            // ignore , this is right
        }

        try {
            await instance.freeze(user2, -1, {from: owner})
            assert.equal(1, 0, "test fail")
        } catch(e) {
            // ignore , this is right
        }

        try {
            await instance.freeze(user2, 2 ** 32, {from: owner})
            assert.equal(1, 0, "test fail, overflow")
        } catch(e) {
            // ignore , this is right
        }
        
    })

    it("test transferOwnership", async() => {
        let owner = accounts[0]
        let newOwner = accounts[1]
        let instance = await CDSToken.deployed()
        let expectOwner = await instance.owner.call()
        assert.equal(expectOwner.valueOf(), owner, "Owner isn't correct")
        await instance.transferOwnership(newOwner)
        let expectNewOwner = await instance.owner.call()
        assert.equal(expectNewOwner.valueOf(), newOwner, "Owner isn't correct")
    })
})