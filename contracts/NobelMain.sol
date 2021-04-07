// ----------------------   Nobel Main Smart Contract  -----------------------------------  //
// |    1) This is the point of contact for a user of Nobel Litterati App                |  // 
// |    @func createLitter - Creates NFT and send Reward to user                         |  //
// |    @func getLittersContractAddress - Returns OpenNFT contract address               |  //
// |    @func getNobelsContractAddress - Returns Nobel Token Contract address            |  //
// |    @func getBalanceOfLitter - Returns Litter NFT Balance of user                    |  //
// |    @func getBalanceOfNobels - Returns NBT Token Balance of user                     |  //
// ---------------------------------------------------------------------------------------  //

pragma solidity ^0.8.0;

import './OpenNFT.sol';
import './NobelToken.sol';

contract NobelMain is Ownable {

    mapping(address => string) public user_address_to_user_name;
    mapping(address => uint8) public isRegistered;
    
    // Open NFT contract Instance
    OpenNFT litters;

    // Nobel Token Contract Instance
    NobelToken nobels;
    
    /*
        Constructor
        @params - type: address - _litter - address of OpenNft Smart Contract
        @params - type: uint - _initial_supply - Initial supply of ERC20 based NBT token
        @params - type: uint - _minting_allowance_per_call - Minting allowance per call for NBT Token
        @params - type: uint - _cool_down_time_per_mint - Coold Down Time between minting

        Stores Open NFT contract address
        Deploys NBT Token.

     */
    
    constructor (
        address _litter,
        uint _initial_supply,
        uint _minting_allowance_per_call,
        uint _cool_down_time_per_mint
        ) public {
        litters = OpenNFT(_litter);
        nobels = new NobelToken(_initial_supply, _minting_allowance_per_call, _cool_down_time_per_mint);
    }

    function registerUser(string memory _user_name) public {
        require(isRegistered[msg.sender]!=1, 'User already registered');
        user_address_to_user_name[msg.sender] = _user_name;
        isRegistered[msg.sender] = 1;
    }

    /*
        @func createNobelLitter
        @params - type: string - _litterUri - Hash of Image uploaded on IPFS
        @params - type: string - _caption - Litter caption given by user

        Calls createNFT function from Open NFT contract, to create NFT and stores returned value in @var reward
        Transfers reward uint of NBT token to caller
    */

    function createNobelLitter(string memory _litterUri, string memory _caption) public {
        require(isRegistered[msg.sender]!=0, 'User not Registered');
        uint reward = litters.createNFT(msg.sender, _litterUri, _caption);
        nobels.transfer(msg.sender, reward);
    }

    /*
        @func getLittersContractAddress
        returns the address of Open NFT Smart Contract
     */
    
    function getLittersContractAddress() public view returns(address litter_){
        return address(litters);
    }

    /*
        @func getNobelsContractAddress
        returns the address of Nobel Token or NBT Smart Contract
     */
    
    function getNobelsContractAddress() public view returns(address nobel_){
        return address(nobels);
    }
    
    /*
        @func getBalanceOfLitter
        @params - type: address - address whose balance is requested
        return Open NFT token Balance or Litter Balance

     */

    function getBalanceOfLitter(address _checker) public view returns(uint balance_){
        return litters.balanceOf(_checker);
    }

    /*
        @func getBalanceOfNobels
        @params - type: address - address whose balance is requested
        return Nobel Token token Balance or NBT Balance

     */
    
    function getBalanceOfNobels(address _checker) public view returns(uint balance_){
        return nobels.balanceOf(_checker);
    }

    fallback () external {
        revert();
    }
    
}