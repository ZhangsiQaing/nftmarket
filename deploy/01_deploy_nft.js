const { network } = require("hardhat");
const { devlopmentChains, CONFIRMATIONS } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  let confirmations;
  if (devlopmentChains.includes(network.name)) {
    confirmations = 0;
  } else {
    confirmations = CONFIRMATIONS;
  }

  log("Deploying the MyNFT contract...");
  const myNftDeployment = await deploy("MyNFT", {
    from: deployer,
    log: true,
    args: ["MyNFT Collection", "MNFT"],
    waitConfirmations: confirmations
  });

  if (myNftDeployment.newlyDeployed) {
    log(`MyNFT contract deployed at: ${myNftDeployment.address}`);
  } else {
    log(`MyNFT contract already deployed at: ${myNftDeployment.address}`);
  }
}

module.exports.tags = ["all", "mynft"];