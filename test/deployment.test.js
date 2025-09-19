const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts, network } = require("hardhat");

describe("合约部署", function () {
  let myNFT, factory, deployer;

  before(async function () {
    // 获取部署者地址
    deployer = (await getNamedAccounts()).deployer;

    if (network.name === "hardhat" || network.name === "localhost") {
      // 本地环境，部署合约
      await deployments.fixture(["all"]);
    }

    // 不管本地还是外网，都尝试读取 deployments
    const myNFTDeployment = await deployments.get("MyNFT");
    const factoryDeployment = await deployments.get("NFTAuctionFactory");

    myNFT = await ethers.getContractAt("MyNFT", myNFTDeployment.address);
    factory = await ethers.getContractAt("NFTAuctionFactory", factoryDeployment.address);
  });

  it("应该成功部署 MyNFT", async function () {
    expect(await myNFT.name()).to.equal("MyNFT Collection");
    expect(await myNFT.symbol()).to.equal("MNFT");

    console.log("myNFT脚本所有者：",await myNFT.owner())
  });

  it("应该成功部署 Factory", async function () {
    console.log("factory脚本所有者：",await factory.owner())
    expect(await factory.owner()).to.equal(deployer);
  });
});


// const { expect } = require("chai");
// const { ethers, deployments, getNamedAccounts } = require("hardhat");

// describe("合约部署", function () {
//   let myNFT, factory, deployer;

//   beforeEach(async function () {
//     await deployments.fixture(["all"]);
//     const myNFTDeployment = await deployments.get("MyNFT");
//     const factoryDeployment = await deployments.get("NFTAuctionFactory");
//     myNFT = await ethers.getContractAt("MyNFT", myNFTDeployment.address);
//     factory = await ethers.getContractAt("NFTAuctionFactory", factoryDeployment.address);
//     deployer = (await getNamedAccounts()).deployer;
//   });

//   it("应该成功部署 MyNFT", async function () {
//     expect(await myNFT.name()).to.equal("MyNFT Collection");
//     expect(await myNFT.symbol()).to.equal("MNFT");
//   });

//   it("应该成功部署 Factory", async function () {
//     expect(await factory.owner()).to.equal(deployer);
//   });
// });