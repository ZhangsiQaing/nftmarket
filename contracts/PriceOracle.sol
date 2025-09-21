// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract PriceOracle {
    // 价格预言机映射
    mapping(address => AggregatorV3Interface) public priceFeeds;
    
    // 设置价格预言机
    function setPriceFeed(
        address tokenAddress,
        address _priceFeed
    ) public {
        priceFeeds[tokenAddress] = AggregatorV3Interface(_priceFeed);
    }

    // 获取价格数据（通过映射）
    function getChainlinkDataFeedLatestAnswer(address tokenAddress) public view returns (int256) {
        AggregatorV3Interface priceFeed = priceFeeds[tokenAddress];
        require(address(priceFeed) != address(0), "Price feed not set");
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return answer;
    }

    // 直接获取价格（原有功能）
    function getOrice(address payToken) public view returns (int256 amount) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(payToken);

         // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return answer;
    }
}


