// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract NarwhalToken is ERC20("Narhwal Token", "NWL") {
    mapping(address => uint256) _stakeTimestamp;
    mapping(address => uint256) _totalStake;
    uint256 _rewardRate = 100;

    constructor(uint256 amount) {
        _mint(msg.sender, amount);
    }

    function stake(uint256 amount) public {
        // transfer from caller to this contract
        _transfer(msg.sender, address(this), amount);
        _totalStake[msg.sender] += amount;

        if (_stakeTimestamp[msg.sender] == 0) {
            _stakeTimestamp[msg.sender] = block.timestamp;
        }
    }

    function getCurrentReward(address staker) public view returns (uint256){
        require(_totalStake[staker] > 0, "No stakers for this staker");
        uint256 reward = (block.timestamp - _stakeTimestamp[staker]) * _rewardRate;
        return reward;
    }

    function withdraw() public {
        uint256 totalStakes = _totalStake[msg.sender];
        uint256 rewards = getCurrentReward(msg.sender);

        _mint(msg.sender, rewards);
        _transfer(address(this), msg.sender, totalStakes);
    }
}