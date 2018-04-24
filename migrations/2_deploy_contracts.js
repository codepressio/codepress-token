var CPToken = artifacts.require("./CPToken.sol");

module.exports = function(deployer) {
  deployer.deploy(CPToken);
};
