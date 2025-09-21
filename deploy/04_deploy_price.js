const { network, run, ethers } = require("hardhat");
const { devlopmentChains, CONFIRMATIONS } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {

    const { deployer } = await getNamedAccounts();
    const { deploy, log, get } = deployments;

    let confirmations;
    if (devlopmentChains.includes(network.name)) {
        confirmations = 0;
    } else {
        confirmations = CONFIRMATIONS;
    }

    const PriceOrcleDeployment = await deploy("PriceOracle", {
        from: deployer,
        log: true,
        args: [],
        waitConfirmations: confirmations
    });

    if (PriceOrcleDeployment.newlyDeployed) {
        log(`PriceOrcle contract deployed at: ${PriceOrcleDeployment.address}`);
    }

    //获取合约对象
    const priceOracle = await ethers.getContractAt("PriceOracle", PriceOrcleDeployment.address);

    console.log("=== 测试 PriceOracle 合约 ===");
    
    // 1. 测试直接获取价格（原有功能）
    console.log("1. 测试直接获取价格...");
    const directPrice = await priceOracle.getOrice("0x694AA1769357215DE4FAC081bf1f309aDC325306");
    console.log("直接获取价格:", directPrice.toString());
    console.log("ETH 价格 (USD):", Number(directPrice) / (10 ** 8));
    
    // 2. 测试设置价格预言机
    console.log("2. 测试设置价格预言机...");
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const chainlinkAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
    
    console.log("设置前检查 priceFeeds[zeroAddress]:", await priceOracle.priceFeeds(zeroAddress));
    
    await priceOracle.setPriceFeed(zeroAddress, chainlinkAddress);
    console.log("✅ 价格预言机设置成功");
    
    console.log("设置后检查 priceFeeds[zeroAddress]:", await priceOracle.priceFeeds(zeroAddress));
    
    // 3. 测试通过映射获取价格
    console.log("3. 测试通过映射获取价格...");
    let mappedPrice;
    try {
        mappedPrice = await priceOracle.getChainlinkDataFeedLatestAnswer(zeroAddress);
        console.log("映射获取价格:", mappedPrice.toString());
        console.log("ETH 价格 (USD):", Number(mappedPrice) / (10 ** 8));
    } catch (error) {
        console.log("❌ 映射获取价格失败:", error.message);
        console.log("priceFeeds[zeroAddress] 地址:", await priceOracle.priceFeeds(zeroAddress));
        return; // 如果获取失败，直接返回
    }
    
    // 4. 验证价格是否一致
    console.log("4. 验证价格一致性...");
    if (directPrice.toString() === mappedPrice.toString()) {
        console.log("✅ 两种方式获取的价格一致");
    } else {
        console.log("❌ 两种方式获取的价格不一致");
    }
    
    console.log("=== PriceOracle 测试完成 ==="); 
}

module.exports.tags = ["price"]