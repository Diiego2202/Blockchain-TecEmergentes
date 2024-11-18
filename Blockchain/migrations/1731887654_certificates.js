const Certificates = artifacts.require('../contract/Certificates.sol');

module.exports = async function (_deployer) {
  await _deployer.deploy(Certificates);
  await Certificates.deployed();
};