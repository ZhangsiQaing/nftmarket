// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NftAuction is Initializable,OwnableUpgradeable,ReentrancyGuardUpgradeable,UUPSUpgradeable {

    // 事件
    event BidPlaced(address indexed bidder, uint256 amount);
    event AuctionEnded(address indexed winner, uint256 finalBid);

    // 合约工厂地址
    address public factory;
    // NFT合约地址
    address public nftContract;
    // NFT标识
    uint256 public tokenId;
    // 卖家地址
    address public seller;
    // 支付代币地址
    address public paymentToken;
    // 起始价格
    uint256 public startingPrice;
    // 拍卖持续时间
    uint256 public duration;
    // 最高出价者
    address public highestBidder;
    // 最高出价
    uint256 public highestBid;
    // 是否结束
    bool public ended;
    // 
    // address public tokenAddress;

    function initialize(
        address _nftContract,
        uint256 _tokenId,
        address _paymentToken,
        uint256 _startingPrice,
        uint256 _duration,
        address _seller
    ) public initializer {
        nftContract = _nftContract;
        tokenId = _tokenId;
        paymentToken = _paymentToken;
        startingPrice = _startingPrice;
        duration = block.timestamp + _duration;
        seller = _seller;
        factory = msg.sender;

        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
    }

    // mapping(address => AggregatorV3Interface) public priceFeeds;
    mapping(address => AggregatorV3Interface) public priceFeeds;

    // 买家参与竞拍
    function placeBid(uint256 amount,address _tokenAddress) external payable nonReentrant {

        require(block.timestamp < duration, "Auction already ended");

        // 判断出价
        uint256 payValue;
        if (_tokenAddress == address(0)) { //ETH出价
            amount = msg.value;
            payValue = amount * uint256(getChainlinkDataFeedLatestAnswer(address(0)));
        } else {
            payValue = amount * uint256(getChainlinkDataFeedLatestAnswer(_tokenAddress));
        }

        //获取拍卖当前价格价值
        uint256 startPriceValue = startingPrice * uint256(getChainlinkDataFeedLatestAnswer(paymentToken));
        //获取拍卖最高价格价值
        uint256 highestBidValue = highestBid * uint256(getChainlinkDataFeedLatestAnswer(paymentToken));

        // 判断出价是否大于开始价格
        require(payValue >= startPriceValue,"Bid must be at least the starting price");
        // 判断出价是否大于当前最高价格
        require(payValue > highestBidValue,"There already is a higher bid");

        // 退还之前的最高出价
        if (highestBidder != address(0)) {
            if (paymentToken == address(0)) {
                payable(highestBidder).transfer(highestBid);
            }else{
                require(IERC20(paymentToken).transfer(
                    highestBidder,
                    highestBid
                ), "ERC20 refund failed");
            }
        }

        // 设置最高出价人
        highestBidder = msg.sender;
        // 设置最高出价金额
        if (_tokenAddress == address(0)) {
            highestBid = msg.value;
        } else {
            highestBid = amount;
        }
        paymentToken = _tokenAddress;
        
        emit BidPlaced(msg.sender, msg.value);
    }


    // 结束拍卖
    function endedAuction() external nonReentrant {
        require(block.timestamp >= duration, "Auction not yet ended");
        require(!ended, "Auction already ended");

        ended = true;

        if (highestBidder != address(0)) {
            // 转移 NFT 给最高出价者
            IERC721(nftContract).transferFrom(address(this), highestBidder, tokenId);
            // 支付给卖家
            if (paymentToken == address(0)) {
                // payable(seller).transfer(highestBid);
                (bool sent, ) = seller.call{value: highestBid}("");
                require(sent, "ETH transfer failed");
            } else {
                IERC20(paymentToken).transfer(seller, highestBid);
            }
            
            emit AuctionEnded(highestBidder, highestBid);
        } else {
            // 如果没有出价，退还 NFT 给卖家
            IERC721(nftContract).transferFrom(address(this), seller, tokenId);
            emit AuctionEnded(address(0), 0);
        }
    }


    //设置价格地址
    function setPriceFeed(
        address tokenAddress,
        address _priceFeed
    ) public {
        require(msg.sender == owner() || msg.sender == seller, "Only owner or seller can set price feed");
        priceFeeds[tokenAddress] = AggregatorV3Interface(_priceFeed);
    }

    // 根据tokenId 获取价格
    function getChainlinkDataFeedLatestAnswer(address tokenAddress) public view returns (int256) {
        AggregatorV3Interface priceFeed = priceFeeds[tokenAddress];
        // require(address(priceFeed) != address(0), "Price feed not set");
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

    // UUPS升级授权，只有合约所有者可以发起升级
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}


}