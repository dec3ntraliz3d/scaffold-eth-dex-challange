// deploy/01_deploy_dex.js

const { ethers } = require("hardhat");
const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const balloons = await ethers.getContract("Balloons", deployer);

  await deploy("Dex", {
    from: deployer,
    log: true,
    args: [balloons.address],
    //waitConfirmations: 5,
  });

  // Getting a previously deployed contract
  const dex = await ethers.getContract("Dex", deployer);



  //approve Dex contract for token transfer.
  const deployerTokenBalance = await balloons.balanceOf(deployer)
  await balloons.approve(dex.address, deployerTokenBalance);

  // Call init function for providing initial liquidity.
  await dex.init(deployerTokenBalance, { value: ethers.utils.parseEther("1") })


  // Verify on etherscan if its not on local network 

  try {
    if (chainId !== localChainId) {
      await run("verify:verify", {
        address: dex.address,
        contract: "contracts/Dex.sol:Dex",
        contractArguments: [balloons.address],
      });
    }
  } catch (error) {
    console.error(error);
  }
};
module.exports.tags = ["Dex", "All"];
