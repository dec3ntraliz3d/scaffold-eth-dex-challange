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
  dexEthBalance,
  dexTokenBalance

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

  const userEthBalance = useBalance(localProvider, address)
  const userTokenBalance = useContractReader(
    readContracts,
    "Balloons",
    "balanceOf",
    [address],


  )
  const dexAddress = readContracts?.Dex?.address;

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
  // const [approving, setApproving] = useState(false)
  // const [swapping, setSwapping] = useState(false)

  let approving, swapping = false

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

    swapping = true;
    outputToken === "BAL" ?
      await tx(writeContracts?.Dex?.ethToToken({ value: ethers.utils.parseEther(inputAmount) })) :
      await tx(writeContracts?.Dex?.tokenToEth(ethers.utils.parseEther(inputAmount)));

    swapping = false;
  }


  return (
    <div style={{ marginTop: 10 }}>
      <Card title="Swap Tokens" >

        <div style={{ padding: 6, marginTop: 32 }}>
          <Input
            addonBefore={selectBefore}
            // value={inputAmount}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              setInputAmount(value ? value.toString() : "0");
            }}
          />
          <Text
            type="secondary"
          >
            {`${outputToken === "ETH" ? ethers.utils.formatEther(userTokenBalance) : ethers.utils.formatEther(userEthBalance)}`}
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
              approving = true;
              await tx(writeContracts?.Balloons?.approve(
                dexAddress,
                inputAmount
                &&
                ethers.utils.parseEther(inputAmount)
              ));

              approving = false;

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
        addingEth={outputToken === "BAL" ? inputAmount && parseFloat(inputAmount) : 0}
        addingToken={outputToken === "ETH" ? inputAmount && parseFloat(inputAmount) : 0}
        ethReserve={dexEthBalance ? ethers.utils.formatEther(dexEthBalance) : 0}
        tokenReserve={dexTokenBalance ? ethers.utils.formatEther(dexTokenBalance) : 0}
        width={300}
        height={300}
      />
    </div>

  );
}


