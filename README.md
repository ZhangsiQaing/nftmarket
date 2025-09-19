# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js

使用remixd
npx remixd


// 测试deploy 脚本
npx hardhat deploy --network sepolia --tags factory


// 测试单独的测试脚本
npx hardhat test test/deployment.test.js --network sepolia


```
