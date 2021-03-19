pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import '@openzeppelin/contracts/access/Ownable.sol';

contract OpenNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter public tokenId;

    string private baseUri;

    event NFTInitialised(uint _time, address _caller);

    mapping(uint => string) private tokenURIs;

    mapping(address => uint[]) private user_to_tokens;  //new

    constructor (
        string memory _name,
        string memory _symbol
    ) 
    public 
    ERC721(_name, _symbol)
    {
        emit NFTInitialised(block.timestamp, msg.sender);
    }

    function createNFT(address _creator, string memory _tokenURI) 
                                    public returns(uint _reward) {
        tokenId.increment();

        uint newTokenId = tokenId.current();

        _mint(_creator, newTokenId);
        tokenURIs[newTokenId] = _tokenURI;

        user_to_tokens[_creator].push(newTokenId);  //new

        return 1;
    }

    function getUserNFTs(address _creator) public 
                                view returns(uint[] memory _tokens) {
        return user_to_tokens[_creator];
    }

    function getTokenUri(uint _tokenId) public 
                                view returns(string memory tokenUri_){
        return tokenURIs[_tokenId];
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory _uri) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, tokenURIs[tokenId]))
            : '';
    }

    function setBaseUrl(string memory baseUri_) public onlyOwner {
        baseUri = baseUri_;
    }

    function _baseURI() internal override view returns(string memory _base_URI){
        return baseUri;
    }

}