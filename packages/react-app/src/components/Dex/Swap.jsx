import React, { useEffect } from "react";
import { BigNumber, ethers } from "ethers";
import { useState } from "react";
import { Button, Card, Input, Select, Typography, Space } from "antd";
import "antd/dist/antd.css";
import { useContractReader, useBalance } from "eth-hooks";
import Text from "antd/lib/typography/Text";
import Curve from "./Curve";

const { Option } = Select;

export default function Swap({

  readContracts,
  writeContracts,
  tx,
  localProvider,
  address,

}) {

  // Setup Input token selector. Default is set to ETH - > BAL ( Balloons)

  const [outputToken, setOutputToken] = useState("BAL");

  const selectBefore = (
    <Select
      defaultValue="ETH"
      onChange={(value) => {

        if (value === "ETH") {
          setOutputToken("BAL");
        }
        else {
          setOutputToken("ETH")
        }

      }}
    >
      <Option value="ETH">ETH</Option>
      <Option value="BAL">BAL</Option>
    </Select>
  );

  // Get user balances.

  const userEthBalance = ethers.utils.formatEther(useBalance(localProvider, address))
  const userTokenBalance = useContractReader(
    readContracts,
    "Balloons",
    "balanceOf",
    [address]

  )

  // console.log(`userTokenBalance:${userTokenBalance}`)
  //const userTokenBalance = userTokenBalanceBN && ethers.utils.formatEther(userTokenBalanceBN)
  // // Get DEX reserves.

  const dexAddress = readContracts?.Dex?.address;
  const dexEthBalance = useBalance(localProvider, dexAddress);
  const dexTokenBalance = useContractReader(
    readContracts,
    "Balloons",
    "balanceOf",
    [dexAddress]
  )
  // Track current approval amount for this address. 
  const dexApproval = useContractReader(readContracts, "Balloons", "allowance", [
    address, dexAddress
  ]);
  // Keep track of input amount in the swap field. 
  const [inputAmount, setInputAmount] = useState("0")
  // Update output amound based on inputAmount.
  const [outputAmount, setOutputAmount] = useState("0")

  // Call price function to get  swap output. 
  // Probably should change it to offline calculation. 
  useEffect(() => {
    if (outputToken === "BAL") {
      readContracts?.Dex?.price(
        ethers.utils.parseEther(inputAmount ? inputAmount : "0"), dexEthBalance, dexTokenBalance).then((result) => {
          setOutputAmount(ethers.utils.formatEther(result))
        }).catch(err => console.log(err));
    }
    else
      readContracts?.Dex?.price(
        ethers.utils.parseEther(inputAmount ? inputAmount : "0"), dexTokenBalance, dexEthBalance).then((result) => {
          setOutputAmount(ethers.utils.formatEther(result))
        }).catch(err => console.log(err));

  }, [inputAmount])

  // Track if swap amount is approved by the token contract.
  const [approvalRequired, setApprovalRequired] = useState(false)

  // Control the loading options for swap and approve button
  const [approving, setApproving] = useState(false)
  const [swapping, setSwapping] = useState(false)

  // Check token approval amount whenever inputAmout or dexApproval amount has changed.
  useEffect(() => {
    if (outputToken === "ETH") {
      const inputAmountBN = inputAmount && ethers.utils.parseEther("" + inputAmount);
      setApprovalRequired(dexApproval && inputAmount && dexApproval.lt(inputAmountBN));
    }

  }, [inputAmount, dexApproval])

  // Disable approval 
  useEffect(() => {
    outputToken === "BAL" ? setApprovalRequired(false) : setApprovalRequired(true);
    setInputAmount("")
    setOutputAmount("")
  }, [outputToken])

  const handleSwap = async () => {

    setSwapping(true);
    outputToken === "BAL" ?
      await tx(writeContracts?.Dex?.ethToToken({ value: ethers.utils.parseEther(inputAmount) })) :
      await tx(writeContracts?.Dex?.tokenToEth(ethers.utils.parseEther(inputAmount)));

    setSwapping(false);
  }


  return (
    <div style={{ marginTop: 10 }}>
      <Card title="Swap Tokens" style={{ width: 350, height: 300 }} >

        <div style={{ padding: 6, marginTop: 32 }}>
          <Input
            addonBefore={selectBefore}
            value={inputAmount}
            onChange={(e) => {
              setInputAmount(e.target.value);
            }}
          />
          <Text
            type="secondary"
          >
            {`${outputToken === "ETH" ? ethers.utils.formatEther(userTokenBalance) : userEthBalance}`}
          </Text>
        </div>
        <div style={{ padding: 8 }}>
          <Text strong>
            {`${outputToken}: ${outputAmount}`}
          </Text>
        </div>
        <Space >
          <Button
            type={"secondary"}
            disabled={!approvalRequired}
            loading={approving}
            onClick={async () => {
              setApproving(true)
              // const resetAmount = inputAmount
              await tx(writeContracts?.Balloons?.approve(
                dexAddress,
                inputAmount
                &&
                ethers.utils.parseEther(inputAmount)
              ));

              setApproving(false);

            }}

          >
            Approve
          </Button>
          <Button
            type={"primary"}
            loading={swapping}
            disabled={approvalRequired}
            onClick={handleSwap}
          >
            Swap
          </Button>
        </Space>
      </Card>
      <Curve
        addingEth={outputToken === "BAL" ? inputAmount && inputAmount : undefined}
        addingToken={outputToken === "ETH" ? inputAmount && inputAmount : undefined}
        ethReserve={dexEthBalance ? parseFloat(ethers.utils.formatEther(dexEthBalance)) : 0}
        tokenReserve={dexTokenBalance ? parseFloat(ethers.utils.formatEther(dexTokenBalance)) : 0}
        width={300}
        height={300}
      />
    </div>

  );
}


