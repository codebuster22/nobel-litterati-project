pragma solidity ^0.8.0;

import './OpenNFT.sol';
import '@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol';

contract NobelToken is ERC20PresetMinterPauser {

    uint public minting_allowance_per_call = 10000;
    uint public cool_down_time_per_mint = 17280;
    uint public last_mint_timestamp;

    constructor (
                uint _initial_supply,
                uint _minting_allowance_per_call,
                uint _cool_down_time_per_mint
                )
    public
    ERC20PresetMinterPauser('Nobel Token','NBT')
    {
        _mint(msg.sender, _initial_supply );
        minting_allowance_per_call = _minting_allowance_per_call;
        cool_down_time_per_mint = _cool_down_time_per_mint;
        last_mint_timestamp = block.timestamp;
    }

    modifier allowance_check( uint amt ) {
        require( amt <= minting_allowance_per_call , "Cannot mint more than allowance" );
        _;
    }

    modifier cooldown_check() {
        require( block.timestamp - last_mint_timestamp >= cool_down_time_per_mint , "Cannot increase the supply without cooling down" );
        _;
    }

    function decimals() public view override returns(uint8) {
        return 0;
    }

    function mint(address to, uint amount) public override {
        require(hasRole(MINTER_ROLE, _msgSender()), "ERC20PresetMinterPauser: must have minter role to mint");
        _mint_(to, amount);
    }

    function _mint_(address to, uint amount) private cooldown_check allowance_check(amount) {
        last_mint_timestamp = block.timestamp;
        _mint(to, amount);
    }

}   