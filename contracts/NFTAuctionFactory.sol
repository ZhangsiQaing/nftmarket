// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity  ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {NftAuction} from "./NFTAuction.sol";


contract NFTAuctionFactory is Initializable,OwnableUpgradeable, UUPSUpgradeable {

    // 创建拍卖合约事件
    event AuctionCreated(address indexed auctionAddress,uint256 auctionIndex, address indexed nftAddress, uint256 indexed tokenId);

    // NFT合约地址 => NFT ID => 拍卖合约地址
    mapping(address => mapping(uint256 => address)) public getAuction;

    // 拍卖合约列表
    NftAuction[] public auctions;

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
    }

    // 创建拍卖合约
    function createAuction(
        address _nftAddress,
        uint256 _tokenId,
        address _paymentToken,
        uint256 _startingPrice,
        uint256 _duration
    ) external {
        // 确保调用者是 token 的拥有者（这里 onlyOwner 已经限制了，一并 double-check）
        require(IERC721(_nftAddress).ownerOf(_tokenId) == msg.sender, "caller not token owner");

        // 确保 factory 已经被 token owner 批准
        require(
            IERC721(_nftAddress).getApproved(_tokenId) == address(this) ||
            IERC721(_nftAddress).isApprovedForAll(msg.sender, address(this)),
            "factory not approved to transfer token"
        );

        NftAuction newAuction = new NftAuction();
        newAuction.initialize(_nftAddress, _tokenId, _paymentToken, _startingPrice, _duration, msg.sender);

        // 工厂来完成转移（要求卖家先 approve 工厂）
        IERC721(_nftAddress).transferFrom(msg.sender, address(newAuction), _tokenId);

        // 先获取当前的索引（即数组长度），然后再push
        uint256 auctionIndex = auctions.length;
        auctions.push(newAuction);

        getAuction[_nftAddress][_tokenId] = address(newAuction);
        emit AuctionCreated(address(newAuction), auctionIndex, _nftAddress, _tokenId);
    }

    // UUPS升级授权，只有合约所有者可以发起升级
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

}