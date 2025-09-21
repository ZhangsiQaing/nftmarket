const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts, network } = require("hardhat");

describe("PriceOracle 测试", function () {
  let priceOracle;
  let deployer;

  before(async function () {
    this.timeout(300000);
    deployer = (await getNamedAccounts()).deployer;
    
    // 部署 PriceOracle 合约
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    priceOracle = await PriceOracle.deploy();
    await priceOracle.waitForDeployment();
    
    console.log("PriceOracle 合约地址:", await priceOracle.getAddress());
  });

  it("测试获取 Chainlink 价格数据", async function () {
    this.timeout(300000);
    console.log("=== 开始测试 PriceOracle ===");
    
    // Sepolia 测试网的 ETH/USD 价格预言机地址
    const chainlinkPriceFeedAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
    
    try {
      console.log("1. 调用 getOrice 函数...");
      const price = await priceOracle.getOrice(chainlinkPriceFeedAddress);
      console.log("✅ 价格获取成功:", price.toString());
      
      // 转换为 USD 价格（Chainlink 返回的价格有 8 位小数）
      const priceInUSD = Number(price) / (10 ** 8);
      console.log("ETH 价格 (USD):", priceInUSD);
      
      expect(price).to.be.gt(0);
      console.log("=== PriceOracle 测试完成 ===");
    } catch (error) {
      console.log("❌ 价格获取失败:", error.message);
      throw error;
    }
  });
});
