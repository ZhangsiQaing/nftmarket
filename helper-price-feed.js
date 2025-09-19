const { network } = require("hardhat");
const { devlopmentChains, networkConfig } = require("./helper-hardhat-config");

/**
 * 获取价格预言机地址
 */
async function getPriceFeedAddress() {
  const { deployments } = require("hardhat");
  
  if (devlopmentChains.includes(network.name)) {
    // 本地网络使用Mock价格预言机
    const mockPriceFeed = await deployments.get("MockV3Aggregator");
    return mockPriceFeed.address;
  } else {
    // 测试网使用真实的Chainlink价格预言机
    const dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed;
    if (!dataFeedAddr) {
      throw new Error(`不支持的网络: ${network.name}，请添加对应的Chainlink价格预言机地址`);
    }
    return dataFeedAddr;
  }
}

/**
 * 设置拍卖合约的价格预言机
 */
async function setupPriceFeed(auction, seller, tokenAddress = "0x0000000000000000000000000000000000000000") {
  try {
    const priceFeedAddress = await getPriceFeedAddress();
    
    // 使用seller账户设置价格预言机
    const { ethers } = require("hardhat");
    const sellerSigner = await ethers.getSigner(seller);
    await auction.connect(sellerSigner).setPriceFeed(tokenAddress, priceFeedAddress);
    
    console.log(`价格预言机设置成功: ${priceFeedAddress}`);
    return true;
  } catch (error) {
    console.error("设置价格预言机失败:", error.message);
    return false;
  }
}

module.exports = {
  getPriceFeedAddress,
  setupPriceFeed
};
