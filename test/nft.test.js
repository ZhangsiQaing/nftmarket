const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts, network } = require("hardhat");

describe("NFT 功能", function () {
//   this.timeout(300000); // 适应 Sepolia 网络慢速

  let myNFT;
  let deployer;
  let deployerSigner;
  let user1;
  let user2;

  before(async function () {
    deployer = (await getNamedAccounts()).deployer;

    if (network.name === "hardhat" || network.name === "localhost") {
      await deployments.fixture(["all"]);
    }

    const myNFTDeployment = await deployments.get("MyNFT");
    myNFT = await ethers.getContractAt("MyNFT", myNFTDeployment.address);

    const signers = await ethers.getSigners();
    user1 = signers[0];
    user2 = signers[1];

    deployerSigner = await ethers.getSigner(deployer);
  });

  it("应该能够铸造 NFT 给 user1", async function () {
    // 取当前 tokenId（不调用 toNumber）
    const startId = Number(await myNFT.getCurrentTokenId());

    const tx = await myNFT.connect(deployerSigner).safeMint(user1.address);
    await tx.wait();

    const endId = Number(await myNFT.getCurrentTokenId());

    expect(await myNFT.ownerOf(startId)).to.equal(user1.address);
    expect(endId - startId).to.equal(1);
  });

  it("应该能够铸造多个 NFT 给 user1 和 user2", async function () {
    const startId = Number(await myNFT.getCurrentTokenId());

    const tx1 = await myNFT.connect(deployerSigner).safeMint(user1.address);
    await tx1.wait();

    const tx2 = await myNFT.connect(deployerSigner).safeMint(user2.address);
    await tx2.wait();

    const endId = Number(await myNFT.getCurrentTokenId());

    expect(await myNFT.ownerOf(startId)).to.equal(user1.address);
    expect(await myNFT.ownerOf(startId + 1)).to.equal(user2.address);

    expect(endId - startId).to.equal(2);
  });
});





// const { expect } = require("chai");
// const { ethers, deployments, getNamedAccounts } = require("hardhat");

// describe("NFT 功能", function () {
//   let myNFT;
//   let deployer;
//   let user1;
//   let user2;

//   beforeEach(async function () {
//     await deployments.fixture(["all"]);
//     const myNFTDeployment = await deployments.get("MyNFT");
//     myNFT = await ethers.getContractAt("MyNFT", myNFTDeployment.address);

//     const accounts = await getNamedAccounts();
//     deployer = accounts.deployer;
//     [user1, user2] = await ethers.getSigners();
//   });

//   it("应该能够铸造 NFT", async function () {
//     const tx = await myNFT.safeMint(user1.address);
//     await tx.wait();

//     expect(await myNFT.ownerOf(0)).to.equal(user1.address);
//     expect(await myNFT.getCurrentTokenId()).to.equal(1);
//   });

//   it("应该能够铸造多个 NFT", async function () {
//     await myNFT.safeMint(user1.address);
//     await myNFT.safeMint(user2.address);

//     expect(await myNFT.ownerOf(0)).to.equal(user1.address);
//     expect(await myNFT.ownerOf(1)).to.equal(user2.address);
//     expect(await myNFT.getCurrentTokenId()).to.equal(2);
//   });
// });