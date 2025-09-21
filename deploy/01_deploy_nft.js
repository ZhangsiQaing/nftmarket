const { network, run } = require("hardhat");
const { developmentChains, CONFIRMATIONS } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  let confirmations;
  if (developmentChains.includes(network.name)) {
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
}

module.exports.tags = ["all", "mynft"];