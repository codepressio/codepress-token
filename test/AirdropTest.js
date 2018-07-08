var Airdrop = artifacts.require('./Airdrop.sol')
var CDSToken = artifacts.require('./CDSToken.sol')

contract('Airdrop', async(accounts) => {
    it("test send candy", async() => {
        let owner = accounts[0]
        let user1 = accounts[1]
        let user2 = accounts[2]

        let airdrop = await Airdrop.deployed()
        let cds = await CDSToken.deployed()

        // trasfer cds to this contract
        await cds.transfer(airdrop.address, 5000, {from: owner})

        let receipts = []
        let values = []

        await receipts.push(user1)
        await receipts.push(user2)

        await values.push(100)
        await values.push(1000)
        
        // send candy
        await airdrop.sendCandy(receipts, values, {from: owner})

        let receiptsInAirdrop = await airdrop.receipts()
        console.log(receiptsInAirdrop)
        assert.equal(2, receiptsInAirdrop.length, "accounts length not equal")
    })
})


var expectThrow = async promise => {
    try {
      await promise
    } catch (error) {
      const invalidOpcode = error.message.search('invalid opcode') >= 0
      const outOfGas = error.message.search('out of gas') >= 0
      const revert = error.message.search('revert') >= 0
      assert(
        invalidOpcode || outOfGas || revert,
        'Expected throw, got \'' + error + '\' instead',
      )
      return
    }
    assert.fail('Expected throw not received')
  };