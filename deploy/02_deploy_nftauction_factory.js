const { getNamedAccounts, run } = require("hardhat");
const { developmentChains, CONFIRMATIONS } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments, ethers, network }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  let confirmations;
  if (developmentChains.includes(network.name)) {
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

  // 在测试网上验证合约
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    console.log("开始验证 NFTAuctionFactory 合约...");
    try {
      await run("verify:verify", {
        address: factoryDeployment.address,
        constructorArguments: [],
      });
      console.log("✅ NFTAuctionFactory 合约验证成功");
    } catch (error) {
      console.log("❌ NFTAuctionFactory 合约验证失败:", error.message);
    }
  } else {
    console.log("跳过合约验证（本地环境或缺少ETHERSCAN_API_KEY）");
  }
};

module.exports.tags = ["all", "factory"];