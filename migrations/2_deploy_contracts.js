var CDSToken = artifacts.require("./CDSToken.sol");
var Airdrop = artifacts.require("./Airdrop.sol");

module.exports = function(deployer) {
  deployer.deploy(CDSToken).then(function() {
    return deployer.deploy(Airdrop, CDSToken.address);
  });
};
