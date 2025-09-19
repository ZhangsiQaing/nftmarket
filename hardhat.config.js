require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  namedAccounts: {
    deployer: {
      default: 0, // 第一个账户作为部署者
      sepolia: 2,
    },
    user1: {
      default: 1,
      sepolia: 0,
    },
    user2: {
      default: 2,
      sepolia: 1,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: [
        process.env.PRIVATE_KEY_ACCOUNT1,
        process.env.PRIVATE_KEY_ACCOUNT2,
        process.env.PRIVATE_KEY_DEPLOYER,
      ].filter(Boolean),
      chainId: 11155111,
    },
  },
};
