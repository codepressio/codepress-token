var CDSToken = artifacts.require("./CDSToken.sol");

module.exports = function(deployer) {
  deployer.deploy(CDSToken);
};
