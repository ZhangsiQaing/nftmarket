// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable {
    // NFT计数
    uint256 private _tokenIdCounter;
    // 基础URI
    string private _baseTokenURI;
    
    // 事件
    event NFTMinted(address indexed to, uint256 indexed tokenId);

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {
    }

    // 铸造NFT（仅所有者）
    function safeMint(address to) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        
        emit NFTMinted(to, tokenId);
        return tokenId;
    }


    // 获取当前tokenId计数
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter;
    }

    // 重写tokenURI函数
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    // 重写支持接口检测
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // 获取基础URI
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}