const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts, network } = require("hardhat");

describe("部署方式对比测试", function () {
  let myNFT;
  let factory;
  let deployer;
  let deployerSigner;

  before(async function () {
    this.timeout(300000);
    deployer = (await getNamedAccounts()).deployer;
    deployerSigner = await ethers.getSigner(deployer);
    
    // 部署基础合约
    if (network.name === "hardhat" || network.name === "localhost") {
      await deployments.fixture(["all"]);
    }
    
    const myNFTDeployment = await deployments.get("MyNFT");
    const factoryDeployment = await deployments.get("NFTAuctionFactory");
    
    myNFT = await ethers.getContractAt("MyNFT", myNFTDeployment.address);
    factory = await ethers.getContractAt("NFTAuctionFactory", factoryDeployment.address);
    
    console.log("基础合约部署完成");
  });

  it("方式1: 直接部署NFTAuction", async function () {
    this.timeout(300000);
    console.log("=== 方式1: 直接部署NFTAuction ===");
    
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const chainlinkAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
    
    // 直接部署 NFTAuction
    const NFTAuction = await ethers.getContractFactory("NftAuction");
    const directAuction = await NFTAuction.deploy();
    await directAuction.waitForDeployment();
    
    const initTx = await directAuction.initialize(
      zeroAddress, // nftContract
      0, // tokenId
      zeroAddress, // paymentToken
      ethers.parseEther("0.001"), // startingPrice
      60, // duration
      deployerSigner.address // seller
    );
    await initTx.wait();
    console.log("直接部署的 NFTAuction 地址:", await directAuction.getAddress());
    
    // 测试价格预言机
    console.log("设置前 priceFeeds:", await directAuction.priceFeeds(zeroAddress));
    
    try {
      console.log("尝试设置价格预言机...");
      const setTx = await directAuction.connect(deployerSigner).setPriceFeed(zeroAddress, chainlinkAddress);
      await setTx.wait();
      console.log("设置交易成功");
      console.log("设置后 priceFeeds:", await directAuction.priceFeeds(zeroAddress));
      
      console.log("尝试获取价格...");
      const price = await directAuction.getChainlinkDataFeedLatestAnswer(zeroAddress);
      console.log("✅ 直接部署方式价格获取成功:", price.toString());
    } catch (error) {
      console.log("❌ 直接部署方式失败:", error.message);
      console.log("错误详情:", error);
    }
    
    console.log("=== 方式1完成 ===");
  });

  it("方式2: 通过工厂创建拍卖", async function () {
    this.timeout(300000);
    console.log("=== 方式2: 通过工厂创建拍卖 ===");
    
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const chainlinkAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
    try {
      // 铸造NFT
      console.log("开始铸造NFT...");
      const mintTx = await myNFT.connect(deployerSigner).safeMint(deployerSigner.address);
      const mintReceipt = await mintTx.wait();
      console.log("NFT铸造完成");
      
      // 获取实际铸造的tokenId
      const currentTokenId = await myNFT.getCurrentTokenId();
      const tokenId = Number(currentTokenId) - 1; // 因为_counter已经递增了
      console.log("实际铸造的TokenId:", tokenId);
      
      // 授权
      console.log("开始授权...");
      const factoryAddress = await factory.getAddress();
      const nftAddress = await myNFT.getAddress();
      console.log("Factory地址:", factoryAddress);
      console.log("NFT合约地址:", nftAddress);
      console.log("TokenId:", tokenId);
      console.log("Deployer地址:", deployerSigner.address);
      
      // 检查NFT所有者
      const nftOwner = await myNFT.ownerOf(tokenId);
      console.log("NFT所有者:", nftOwner);
      console.log("Deployer地址:", deployerSigner.address);
      
      // 如果NFT所有者不是deployer，需要先转移NFT
      if (nftOwner.toLowerCase() !== deployerSigner.address.toLowerCase()) {
        console.log("NFT所有者不匹配，需要先转移NFT...");
        // 这里需要从当前所有者转移给deployer，但需要当前所有者的私钥
        console.log("❌ 无法转移NFT，因为需要当前所有者的私钥");
        return;
      }
      
      // 检查当前授权状态
      const currentApproval = await myNFT.getApproved(tokenId);
      console.log("当前授权地址:", currentApproval);
      
      const approveTx = await myNFT.connect(deployerSigner).approve(factoryAddress, tokenId);
      await approveTx.wait();
      console.log("授权完成");
      
      // 验证授权是否成功
      const newApproval = await myNFT.getApproved(tokenId);
      console.log("授权后地址:", newApproval);
      
      // 创建拍卖
      console.log("开始创建拍卖...");
      const createAuctionTx = await factory.connect(deployerSigner).createAuction(
        nftAddress,
        tokenId,
        zeroAddress,
        ethers.parseEther("0.001"),
        60
      );
      await createAuctionTx.wait();
      console.log("拍卖创建完成");
      
      const auctionAddress = await factory.getAuction(await myNFT.getAddress(), tokenId);
      const factoryAuction = await ethers.getContractAt("NftAuction", auctionAddress);
      console.log("通过工厂创建的拍卖地址:", auctionAddress);
      
      // 测试价格预言机
      console.log("设置前 priceFeeds:", await factoryAuction.priceFeeds(zeroAddress));
      
      console.log("尝试设置价格预言机...");
      const setTx = await factoryAuction.connect(deployerSigner).setPriceFeed(zeroAddress, chainlinkAddress);
      await setTx.wait();
      console.log("设置交易成功");
      console.log("设置后 priceFeeds:", await factoryAuction.priceFeeds(zeroAddress));
      
      console.log("尝试获取价格...");
      const price = await factoryAuction.getChainlinkDataFeedLatestAnswer(zeroAddress);
      console.log("✅ 工厂创建方式价格获取成功:", price.toString());
      
    } catch (error) {
      console.log("❌ 工厂创建方式失败:", error.message);
      console.log("错误详情:", error);
      
      // 分析具体在哪一步失败
      if (error.message.includes("approve")) {
        console.log("失败在授权步骤");
      } else if (error.message.includes("createAuction")) {
        console.log("失败在创建拍卖步骤");
      } else if (error.message.includes("setPriceFeed")) {
        console.log("失败在设置价格预言机步骤");
      } else if (error.message.includes("getChainlinkDataFeedLatestAnswer")) {
        console.log("失败在获取价格步骤");
      }
    }
    
    console.log("=== 方式2完成 ===");
  });
});
