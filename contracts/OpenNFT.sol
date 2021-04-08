// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import 'https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol';
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/utils/Counters.sol";
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/access/Ownable.sol';

contract OpenNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter public tokenId;

    string private baseUri;

    event NFTInitialised(uint _time, address _caller);

    event NftTokenCreated(address creator, uint tokenId, string tokenUri, string caption);

    mapping(string => bool) private hashExists;

    mapping(uint => string) private tokensHash;

    mapping(uint => address) private token_to_creator;

    mapping(uint => string) private token_to_caption;

    mapping(address => uint[]) private user_to_tokens;  //new

    constructor (
        string memory _name,
        string memory _symbol
    ) 
    ERC721(_name, _symbol)
    {
        setBaseUrl("ipfs.infura.io/ipfs/");
        emit NFTInitialised(block.timestamp, msg.sender);
    }

    modifier nftNotCreated(string memory _hash) {
        require(!hashExists[_hash],"NFT already created");
        _;
    }

    function createNFT(address _creator, string memory _tokenHash, string memory _tokenCaption) 
                                    public nftNotCreated(_tokenHash) returns(uint _reward){
        tokenId.increment();

        uint newTokenId = tokenId.current();

        tokensHash[newTokenId] = _tokenHash;
        user_to_tokens[_creator].push(newTokenId);  //new
        token_to_creator[newTokenId] = _creator;
        token_to_caption[newTokenId] = _tokenCaption;
        hashExists[_tokenHash] = true;

        _mint(_creator, newTokenId);

        emit NftTokenCreated(_creator, newTokenId, tokensHash[newTokenId], _tokenCaption);

        return 1;
    }

    function getUserNFTs(address _creator) public 
                                view returns(uint[] memory _tokens) {
        return user_to_tokens[_creator];
    }

    function getTokenCreator(uint _tokenId) public view returns(address creator){
        return token_to_creator[_tokenId];
    }

    function getTokenCaption(uint _tokenId) public view returns(string memory caption){
        return token_to_caption[_tokenId];
    }

    function getTokenUri(uint _tokenId) public 
                                view returns(string memory tokenUri_){
        return tokensHash[_tokenId];
    }

    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory _uri) {
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, tokensHash[_tokenId]))
            : '';
    }

    function setBaseUrl(string memory baseUri_) public onlyOwner {
        baseUri = baseUri_;
    }

    function _baseURI() internal override view returns(string memory _base_URI){
        return baseUri;
    }

    fallback () external {
        revert();
    }

}