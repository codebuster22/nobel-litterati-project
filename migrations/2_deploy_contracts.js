const OpenNFT = artifacts.require('OpenNFT');
const NobelMain = artifacts.require('NobelMain');

const initialSupply = 1000000;
const allowance = 10000;
const cooldown = 17280;

module.exports = async (deployer) => {
  await deployer.deploy(OpenNFT, "Nobel Litterati", "NB");
  const OpenNftInstance = await OpenNFT.deployed();
  await deployer.deploy(
        NobelMain,
        OpenNftInstance.address,
        initialSupply,
        allowance,
        cooldown
        );
}