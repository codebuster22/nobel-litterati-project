pragma solidity ^0.8.0;

import './OpenNFT.sol';
import './NobelToken.sol';

contract NobelMain is Ownable {
    
    OpenNFT litters;
    NobelToken nobels;
    
    constructor (
        address _litter,
        uint _initial_supply,
        uint _minting_allowance_per_call,
        uint _cool_down_time_per_mint
        ) public {
        litters = OpenNFT(_litter);
        nobels = new NobelToken(_initial_supply, _minting_allowance_per_call, _cool_down_time_per_mint);
    }

    function createNobelLitter(string memory _litterUri) public {
        uint reward = litters.createNFT(msg.sender, _litterUri);
        nobels.transfer(msg.sender, reward);
    }
    
    function getLittersContractAddress() public view returns(address litter_){
        return address(litters);
    }
    
    function getNobelsContractAddress() public view returns(address nobel_){
        return address(nobels);
    }
    
    function getBalanceOfLitter(address _checker) public view returns(uint balance_){
        return litters.balanceOf(_checker);
    }
    
    function getBalanceOfNobels(address _checker) public view returns(uint balance_){
        return nobels.balanceOf(_checker);
    }
    
}