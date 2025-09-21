const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts, network } = require("hardhat");
const { setupPriceFeed } = require("../helper-price-feed");

describe("拍卖功能", function () {
  let myNFT;
  let factory;
  let deployer;
  let deployerSigner;
  let user1;
  let user2;
  let mockPriceFeed;

  before(async function () {
    deployer = (await getNamedAccounts()).deployer;

    const signers = await ethers.getSigners();
    user1 = signers[0];
    user2 = signers[1];
    deployerSigner = await ethers.getSigner(deployer);

    // 本地环境部署合约，测试网使用已部署地址
    if (network.name === "hardhat" || network.name === "localhost") {
        await deployments.fixture(["all"]);
    }

    const myNFTDeployment = await deployments.get("MyNFT");
    const factoryDeployment = await deployments.get("NFTAuctionFactory");


    myNFT = await ethers.getContractAt("MyNFT", myNFTDeployment.address);
    factory = await ethers.getContractAt("NFTAuctionFactory", factoryDeployment.address);

    console.log("NFTAuctionFactory 部署成功:", factoryDeployment.address);
  });

  // it("应该能够铸造 NFT 并创建拍卖", async function () {
  //   this.timeout(120000); // 2分钟超时时间
  //   // 铸造 NFT 给 user1
  //   const mintTx = await myNFT.connect(deployerSigner).safeMint(user1.address);
  //   await mintTx.wait();

  //   // 获取 tokenId
  //   const tokenIdBN = await myNFT.getCurrentTokenId();
  //   const tokenId = tokenIdBN - 1n; // ethers 6 bigint

  //   // 验证 owner
  //   const owner = await myNFT.ownerOf(tokenId);
  //   console.log("tokenId owner:", owner);
  //   expect(owner).to.equal(user1.address);

  //   // user1 授权 Factory 转移 NFT
  //   const approveTx = await myNFT.connect(user1).approve(await factory.getAddress(), tokenId);
  //   await approveTx.wait();
  //   console.log("Factory 授权完成");


  //   console.log("打印合约地址：", await myNFT.getAddress())
  //   // 创建拍卖
  //   const auctionTx = await factory.connect(user1).createAuction(
  //     await myNFT.getAddress(),
  //     tokenId,
  //     ethers.ZeroAddress, // ETH支付，使用零地址
  //     ethers.parseEther("0.005"), // 降低起始价格到 0.005 ETH
  //     3600
  //   );

  //   const receipt = await auctionTx.wait();
  //   console.log("创建拍卖交易状态:", receipt.status);
    
  //   // 验证拍卖合约地址
  //   const auctionAddress = await factory.getAuction(await myNFT.getAddress(), tokenId);
  //   expect(auctionAddress).to.not.equal(ethers.ZeroAddress);

  //   console.log("创建拍卖成功，NFT tokenId:", tokenId.toString(), "拍卖合约地址:", auctionAddress);
  // });

  // it("应该正确处理拍卖时间", async function () {
  //   this.timeout(120000); // 2分钟超时时间
    
  //   const duration = 60;
    
  //   // 铸造 NFT 给 user1
  //   const mintTx = await myNFT.connect(deployerSigner).safeMint(user1.address);
  //   await mintTx.wait();

  //   const tokenIdBN = await myNFT.getCurrentTokenId();
  //   const tokenId = tokenIdBN - 1n;

  //   // 授权 Factory 转移 NFT
  //   const approveTx = await myNFT.connect(user1).approve(await factory.getAddress(), tokenId);
  //   await approveTx.wait();

  //    const createAuctionTx = await factory.connect(user1).createAuction(
  //      await myNFT.getAddress(),
  //      tokenId,
  //      ethers.ZeroAddress, // ETH支付，使用零地址
  //      ethers.parseEther("0.005"), // 降低起始价格到 0.005 ETH
  //      duration
  //    );
    
  //   const createAuctionReceipt = await createAuctionTx.wait();
  //   console.log("创建拍卖交易状态:", createAuctionReceipt.status);
  //   console.log("创建拍卖交易哈希:", createAuctionTx.hash);
  //   console.log("交易日志数量:", createAuctionReceipt.logs.length);
    
  //   // 检查事件日志
  //   // if (createAuctionReceipt.logs.length > 0) {
  //   //   console.log("第一个日志:", createAuctionReceipt.logs[0]);
  //   // }

  //   const auctionAddress = await factory.getAuction(await myNFT.getAddress(), tokenId);
  //   console.log("拍卖合约地址:", auctionAddress);
  //   console.log("NFT合约地址:", await myNFT.getAddress());
  //   console.log("TokenId:", tokenId.toString());
    
  //   // 如果拍卖地址是0，尝试直接查询
  //   if (auctionAddress === ethers.ZeroAddress) {
  //     console.log("拍卖地址为0，尝试其他方法查询...");
  //     // 检查NFT是否已经转移
  //     const nftOwner = await myNFT.ownerOf(tokenId);
  //     console.log("NFT当前所有者:", nftOwner);
  //   }
    
  //   const auction = await ethers.getContractAt("NftAuction", auctionAddress);

  //   // 验证拍卖时间逻辑

  //   const endTime = await auction.duration();
  //   console.log("拍卖结束时间:", endTime.toString());
    
  //   const blockTime = BigInt((await ethers.provider.getBlock("latest")).timestamp);
  //   console.log("当前区块时间:", blockTime.toString());
    
  //   expect(endTime).to.be.gt(blockTime);
  //   expect(endTime - blockTime).to.equal(duration);
  //   console.log("时间验证通过");


  //   // 根据网络环境选择时间推进方式
  //   if (network.name === "hardhat" || network.name === "localhost") {
  //     // 本地环境使用 evm_increaseTime
  //     await ethers.provider.send("evm_increaseTime", [duration + 10]);
  //     await ethers.provider.send("evm_mine");
      
  //      // 验证拍卖已结束
  //      await expect(
  //        auction.connect(user2).placeBid(ethers.parseEther("0.01"), ethers.ZeroAddress, { value: ethers.parseEther("0.01") }) // 降低出价到 0.01 ETH
  //      ).to.be.revertedWith("Auction already ended");
  //   } else {
  //     // 测试网环境跳过时间推进测试
  //     console.log("测试网环境：跳过时间推进测试");
  //   }
  // });


  it("完整拍卖流程测试", async function () {
    this.timeout(300000); // 5分钟超时时间，因为测试网需要更多时间
    
    const duration = 60; // 60秒拍卖时间
    
    console.log("=== 开始完整拍卖流程测试 ===");
    
    // 1. deployer铸造NFT给自己
    console.log("1. deployer铸造NFT...");
    const mintTx = await myNFT.connect(deployerSigner).safeMint(deployerSigner.address);
    await mintTx.wait();
    console.log("NFT铸造完成");

    const tokenIdBN = await myNFT.getCurrentTokenId();
    const tokenId = tokenIdBN - 1n;
    console.log("TokenId:", tokenId.toString());

    // 2. deployer授权Factory转移NFT
    console.log("2. deployer授权Factory转移NFT...");
    const approveTx = await myNFT.connect(deployerSigner).approve(await factory.getAddress(), tokenId);
    await approveTx.wait();
    console.log("授权完成");


    console.log("deployerSigner.address:", deployerSigner.address);
    // 3. deployer创建拍卖
    console.log("3. deployer创建拍卖...");
    // const zeroAddress = "0x0000000000000000000000000000000000000000";
    const zeroAddress = ethers.ZeroAddress;
    const createAuctionTx = await factory.connect(deployerSigner).createAuction(
      await myNFT.getAddress(),
      tokenId,
      zeroAddress, // ETH支付，使用零地址
      ethers.parseEther("0.001"), // 起始价格 0.001 ETH
      duration
    );
    await createAuctionTx.wait();
    console.log("拍卖创建完成");

    const auctionAddress = await factory.getAuction(await myNFT.getAddress(), tokenId);
    const auction = await ethers.getContractAt("NftAuction", auctionAddress);
    console.log("拍卖合约地址:", auctionAddress);

    // 设置价格预言机 - 直接设置
    const { devlopmentChains, networkConfig } = require("../helper-hardhat-config");
    let priceFeedAddress;
    
    if (devlopmentChains.includes(network.name)) {
      // 本地网络使用Mock价格预言机
      const mockPriceFeed = await deployments.get("MockV3Aggregator");
      priceFeedAddress = mockPriceFeed.address;
    } else {
      // 测试网使用真实的Chainlink价格预言机
      priceFeedAddress = networkConfig[network.config.chainId].ethUsdDataFeed;
    }

    console.log("priceFeedAddress:", priceFeedAddress);
    console.log("ethers.ZeroAddress:", ethers.ZeroAddress);
    
    // 检查权限
    const auctionOwner = await auction.owner();
    const auctionSeller = await auction.seller();
    console.log("拍卖合约owner:", auctionOwner);
    console.log("拍卖合约seller:", auctionSeller);
    console.log("deployerSigner地址:", deployerSigner.address);
    console.log("factory地址:", await factory.getAddress());
    
    // 设置价格预言机 - 使用字符串零地址
    console.log("设置前 priceFeeds:", await auction.priceFeeds(zeroAddress));
    
    try {
      console.log("尝试设置价格预言机...");
      const setTx = await auction.connect(deployerSigner).setPriceFeed(zeroAddress, priceFeedAddress);
      await setTx.wait();
      console.log("设置交易成功");
      console.log("设置后 priceFeeds:", await auction.priceFeeds(zeroAddress));
      
      console.log("尝试获取价格...");
      const priceFeedAnswer = await auction.getChainlinkDataFeedLatestAnswer(zeroAddress);
      console.log("✅ 价格获取成功:", priceFeedAnswer.toString());
      console.log("ETH 价格 (USD):", Number(priceFeedAnswer) / (10 ** 8));
    } catch (error) {
      console.log("❌ 价格预言机设置失败:", error.message);
      console.log("错误详情:", error);
    }

    // // 4. user1出价（较低金额）
    // console.log("4. user1出价...");
    // const user1BidVal = ethers.parseEther("0.002"); // user1出价 0.002 ETH
    // const user1BidTx = await auction.connect(user1).placeBid(user1BidVal, ethers.ZeroAddress, { value: user1BidVal });
    // await user1BidTx.wait();
    // console.log("user1出价完成:", ethers.formatEther(user1BidVal), "ETH");

    // // 5. user2出价（更高金额）
    // console.log("5. user2出价...");
    // const user2BidVal = ethers.parseEther("0.005"); // user2出价 0.01 ETH
    // const user2BidTx = await auction.connect(user2).placeBid(user2BidVal, ethers.ZeroAddress, { value: user2BidVal });
    // await user2BidTx.wait();
    // console.log("user2出价完成:", ethers.formatEther(user2BidVal), "ETH");

    // // 验证出价状态
    // const highestBidder = await auction.highestBidder();
    // const highestBid = await auction.highestBid();
    // console.log("最高出价者:", highestBidder);
    // console.log("最高出价:", ethers.formatEther(highestBid), "ETH");
    // expect(highestBidder).to.equal(user2.address);
    // expect(highestBid).to.equal(user2BidVal);

    // // 6. 记录deployer余额变化（应该收到最终出价）
    // const deployerBefore = await ethers.provider.getBalance(deployerSigner.address);
    // console.log("deployer拍卖前余额:", ethers.formatEther(deployerBefore), "ETH");

    // // 7. 根据网络环境选择时间推进方式
    // if (network.name === "hardhat" || network.name === "localhost") {
    //   console.log("6. 本地环境：推进时间...");
    //   await ethers.provider.send("evm_increaseTime", [duration + 10]);
    //   await ethers.provider.send("evm_mine");
    // } else {
    //   console.log("6. 测试网环境：等待真实时间...");
    //   console.log("等待", duration + 10, "秒...");
    //   await new Promise(resolve => setTimeout(resolve, (duration + 10) * 1000));
    // }

    // // 8. 结束拍卖
    // console.log("7. 结束拍卖...");
    // const endTx = await auction.connect(user2).endedAuction();
    // await endTx.wait();
    // console.log("拍卖结束完成");

    // // 9. 验证拍卖结果
    // console.log("8. 验证拍卖结果...");
    // expect(await auction.ended()).to.equal(true);
    // expect(await myNFT.ownerOf(tokenId)).to.equal(user2.address);
    // console.log("NFT已转移给user2");

    // // 10. 验证deployer收到最终出价
    // const deployerAfter = await ethers.provider.getBalance(deployerSigner.address);
    // const deployerGain = deployerAfter - deployerBefore;
    // console.log("deployer收到金额:", ethers.formatEther(deployerGain), "ETH");
    // expect(deployerGain).to.be.gt(0); // deployer应该收到最终出价

    // // 11. 验证user2是最终获胜者
    // const finalHighestBidder = await auction.highestBidder();
    // const finalHighestBid = await auction.highestBid();
    // expect(finalHighestBidder).to.equal(user2.address);
    // expect(finalHighestBid).to.equal(user2BidVal);

    // console.log("=== 完整拍卖流程测试完成 ===");
  });

});



