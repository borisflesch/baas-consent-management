const ConsentsManager = artifacts.require("ConsentsManager");

module.exports = function(deployer) {
  deployer.deploy(ConsentsManager);
};
