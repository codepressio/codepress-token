var Airdrop = artifacts.require('./Airdrop.sol')


contract('Airdrop', async(accounts) => {
    it("test send candy", async() => {
        let owner = accounts[0]
        let user1 = accounts[1]
        let user2 = accounts[2]

        let airdrop = await Airdrop.deployed()
        console.log('contract deployed')

        let size = 2

        let receipts = [size]
        let values = [size]

        await receipts.push(user1)
        await receipts.push(user2)

        await values.push(100)
        await values.push(1000)
        
        console.log('receipts: ' + receipts)
        console.log('values: ' + values)
        // send candy
        await airdrop.sendCandy(receipts, values, {from: owner})
        console.log('candy sended ')

        assert.equal(size, airdrop.receipts.length, "accounts length not equal")
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