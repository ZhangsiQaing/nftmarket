const { getNamedAccounts } = require("hardhat");
const { devlopmentChains, CONFIRMATIONS } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments, ethers, network }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  let confirmations;
  if (devlopmentChains.includes(network.name)) {
    confirmations = 0;
  } else {
    confirmations = CONFIRMATIONS;
  }

  const factoryDeployment = await deploy("NFTAuctionFactory", {
    from: deployer,
    log: true,
    proxy: {
    //   proxyContract: "UUPSProxy",  // 如果你要用 UUPS 模式
      proxyContract: "OpenZeppelinTransparentProxy", // 使用 OpenZeppelin 的透明代理模式
      execute: {
        init: {
          methodName: "initialize",
          args: []
        }
      }
    },
    waitConfirmations: confirmations
  });

  console.log("NFTAuctionFactory 部署成功:", factoryDeployment.address);
};

module.exports.tags = ["all", "factory"];