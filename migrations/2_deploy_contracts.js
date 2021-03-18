const OpenNFT = artifacts.require('OpenNFT');

module.exports = (deployer) => {
  deployer.deploy(OpenNFT, "Nobel Litterati", "NB");
}