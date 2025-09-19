const DECIMAL = 8
const INITIAL_ANSWER = 452800000000 // $2000 ETH price
const devlopmentChains = ["hardhat", "local"]
const CONFIRMATIONS = 5

const networkConfig = {
    11155111: { // Sepolia
        ethUsdDataFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    97: { // BSC Testnet
        ethUsdDataFeed: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7"
    },
    1: { // Mainnet
        ethUsdDataFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
    }
}

module.exports = {
    DECIMAL,
    INITIAL_ANSWER,
    devlopmentChains,
    networkConfig,
    CONFIRMATIONS
}
