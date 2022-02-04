// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");
const localChainId = "31337";


module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy("Balloons", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    //args: [owner],
    log: true,
    waitConfirmations: 5,
  });

  // Getting a previously deployed contract
  const balloons = await ethers.getContract("Balloons", deployer);


  // You can also Verify your contracts with Etherscan here...
  // You don't want to verify on localhost
  try {
    if (chainId !== localChainId) {
      await run("verify:verify", {
        address: balloons.address,
        contract: "contracts/Balloons.sol:Balloons",
        //contractArguments: [owner],
      });
    }
  } catch (error) {
    console.error(error);
  }
};
module.exports.tags = ["Balloons", "All"];
