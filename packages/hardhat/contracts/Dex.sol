pragma solidity 0.8.4;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Dex {
    using SafeMath for uint256;
    IERC20 public token;
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    // init () function will be called by the deployer during the deployment and will
    // deposit both eth and token. Rest of the token will be transferred to owner
    // (frontend address when using localhost) .

    function init(uint256 _amount) public payable returns (uint256) {
        require(
            totalLiquidity == 0,
            "Liquidity pool has already been created for this pair"
        );
        totalLiquidity = address(this).balance;
        liquidity[msg.sender] = totalLiquidity;
        token.transferFrom(msg.sender, address(this), _amount);
        return totalLiquidity;
    }

    // Given an amount, inputReserve, outputReserve price function calculates the
    //output. This function do include 0.3% liqudity provider fees.
    function price(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public view returns (uint256) {
        uint256 inputAmountWithFee = inputAmount.mul(997);
        uint256 numerator = inputAmountWithFee.mul(outputReserve);
        uint256 denominator = inputReserve.mul(1000).add(inputReserve);
        return numerator / denominator;
    }

    function ethToToken() public payable returns (uint256) {
        uint256 outputAmount = price(
            msg.value,
            address(this).balance.sub(msg.value),
            token.balanceOf(address(this))
        );
        require(token.transfer(msg.sender, outputAmount));
        return outputAmount;
    }

    function tokenToEth(uint256 _amount) public returns (uint256) {
        uint256 outputAmount = price(
            _amount,
            token.balanceOf(address(this)),
            address(this).balance
        );
        require(token.transferFrom(msg.sender, address(this), _amount));
        (bool sent, ) = payable(msg.sender).call{value: outputAmount}("");
        require(sent, "Eth transfer failed");
        return outputAmount;
    }

    function deposit() public payable returns (uint256) {
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 ethReserve = address(this).balance - msg.value;
        uint256 tokenRequired = ((msg.value * tokenReserve) / ethReserve) + 1;
        uint256 liquidityAdded = (msg.value * totalLiquidity) / ethReserve;
        liquidity[msg.sender] += liquidityAdded;
        totalLiquidity += liquidityAdded;
        require(token.transferFrom(msg.sender, address(this), tokenRequired));
        return liquidityAdded;
    }

    function withdraw(uint256 _amount) public returns (uint256, uint256) {
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 ethAmount = _amount.mul(address(this).balance) / totalLiquidity;
        uint256 tokenAmount = _amount.mul(tokenReserve) / totalLiquidity;
        liquidity[msg.sender] = liquidity[msg.sender].sub(_amount);
        totalLiquidity = totalLiquidity.sub(_amount);
        (bool sent, ) = payable(msg.sender).call{value: ethAmount}("");
        require(sent, "Eth transfer failed");
        require(token.transfer(msg.sender, tokenAmount));
        return (ethAmount, tokenAmount);
    }
}
