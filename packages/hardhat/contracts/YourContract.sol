pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract YourContract {
    // event SetPurpose(address sender, string purpose);
    using SafeMath for uint256;
    string public purpose = "Building Unstoppable Apps!!!";

    constructor() payable {
        // what should we do on deploy?
    }

    function setPurpose(string memory newPurpose) public {
        purpose = newPurpose;
        console.log(msg.sender, "set purpose to", purpose);
        // emit SetPurpose(msg.sender, purpose);
    }

    function test(
        uint256 msg_value,
        uint256 eth_reserve,
        uint256 token_reserve
    ) public pure returns (uint256) {
        uint256 returnValue = (msg_value.mul(token_reserve) / eth_reserve).add(
            1
        );
        return returnValue;
    }

    // to support receiving ETH by default
    receive() external payable {}

    fallback() external payable {}
}
