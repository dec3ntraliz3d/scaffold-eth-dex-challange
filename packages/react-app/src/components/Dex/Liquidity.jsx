import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import { Button, Card, Divider, Input, Select, Row, Col, Space, Typography, InputNumber } from "antd";
import { ethers, BigNumber } from "ethers";
import { useContractReader } from "eth-hooks";
const { Text, Title } = Typography
const { Option } = Select;

export default function Liquidity({

    readContracts,
    writeContracts,
    localProvider,
    tx,
    address,
    dexEthBalance,
    dexTokenBalance,
    userEthBalance,
    userTokenBalance,

}) {

    const userLiquidityBalance = useContractReader(readContracts, "Dex", "liquidity", [
        address,
    ]);

    const tabList = [
        {
            key: 'Add',
            tab: 'Add',
        },
        {
            key: 'Remove',
            tab: 'Remove',
        },
    ];

    const [ethAmount, setEthAmount] = useState();
    const [tokenAmount, setTokenAmount] = useState()
    const [approvalRequired, setApprovalRequired] = useState(false)

    useEffect(() => {
        if (ethAmount) {
            const tokenRequiredBN = ethers.utils.parseEther(ethAmount).mul(dexTokenBalance).div(dexEthBalance).add(1);
            console.log(`tokenRequiredBN: ${BigNumber.isBigNumber(tokenRequiredBN)}: ${tokenRequiredBN}`)
            const tokenRequired = ethers.utils.formatEther(tokenRequiredBN)
            console.log(`tokenRequired: ${BigNumber.isBigNumber(tokenRequired)}: ${tokenRequired}`)
            setTokenAmount(tokenRequired)
        }
        else setTokenAmount("")

    }, [ethAmount])
    const dexAddress = readContracts?.Dex?.address
    const dexApproval = useContractReader(readContracts, "Balloons", "allowance", [
        address, dexAddress
    ]);
    useEffect(() => {
        if (tokenAmount) console.log(`Checking approval for ${ethers.utils.parseEther(tokenAmount)}`)
        console.log(`dexApproval:${dexApproval} `)
        // If dex approval is needed disable add button and enable approve
        if (tokenAmount) {
            setApprovalRequired(
                dexApproval && tokenAmount && ethers.utils.parseEther("" + tokenAmount).gt(dexApproval))
        }


        if (approvalRequired) console.log("approval required")

    }, [tokenAmount, dexApproval])

    const [approving, setApproving] = useState(false)
    const [addingLiquidity, setAddingLiquidity] = useState(false)
    const [removingLiquidity, setRemovingLiquidity] = useState(false)
    const [removeLiquidityAmount, setRemoveLiquidityAmount] = useState()
    let removingAllLiquidity = false

    const contentList = {
        Add: <>
            <div>
                <Input
                    addonBefore="ETH"
                    onChange={e => {
                        const value = parseFloat(e.target.value)
                        setEthAmount(value ? value.toString() : undefined)
                    }}
                />
                <Text
                    style={{ marginTop: 0 }}
                    type="secondary"
                >
                    {ethers.utils.formatEther(userEthBalance)}
                </Text>
                <Input
                    addonBefore="BAL"
                    value={tokenAmount ? tokenAmount : ""}
                    disabled={true}
                />
                <Text
                    style={{ marginTop: 0 }}
                    type="secondary"
                >
                    {ethers.utils.formatEther(userTokenBalance ? userTokenBalance : "0")}
                </Text>
            </div>

            <Space style={{ marginTop: 10 }}>
                <Button
                    type="secondary"
                    disabled={!approvalRequired}
                    loading={approving}
                    onClick={async () => {
                        setApproving(true)
                        await tx(writeContracts?.Balloons?.approve(
                            dexAddress,
                            tokenAmount
                            &&
                            ethers.utils.parseEther(tokenAmount)
                        ));

                        setApproving(false);

                    }}

                >
                    Approve
                </Button>
                <Button
                    type="primary"
                    disabled={approvalRequired}
                    loading={addingLiquidity}
                    onClick={async () => {
                        setAddingLiquidity(true)
                        await tx(writeContracts?.Dex?.deposit(
                            { value: ethAmount && ethers.utils.parseEther(ethAmount) }
                        ));
                        setAddingLiquidity(false)
                    }}
                >
                    Add
                </Button>
            </Space>

        </>,
        Remove:
            <>
                <Space direction="vertical">

                    <Title level={5}>
                        Liquidity Balance
                    </Title>
                    <Text
                        type="primary"
                        strong>
                        {userLiquidityBalance ? ethers.utils.formatEther(userLiquidityBalance) : "Fetch error"}

                    </Text>
                    <Input
                        onChange={e => {
                            const value = parseFloat(e.target.value)
                            setRemoveLiquidityAmount(value ? value.toString() : value);

                        }}
                    />
                </Space>
                <Space style={{ marginTop: 10 }}>
                    <Button
                        type="secondary"
                        loading={removingLiquidity}
                        onClick={async () => {

                            setRemovingLiquidity(true)
                            if (removeLiquidityAmount && ethers.utils.formatEther(userLiquidityBalance) >= removeLiquidityAmount)
                                await tx(writeContracts?.Dex?.withdraw(ethers.utils.parseEther(removeLiquidityAmount)))
                            setRemovingLiquidity(false)
                        }}

                    >
                        Remove
                    </Button>
                    <Button
                        type="primary"
                        loading={removingAllLiquidity}
                        onClick={async () => {

                            removingAllLiquidity = true
                            await tx(writeContracts?.Dex?.withdraw(userLiquidityBalance))
                            removingAllLiquidity = false
                        }}

                    >
                        Remove All
                    </Button>
                </Space>
            </>
    };

    const [activeTabKey, setActiveTabKey] = useState('Add');
    const onTabChange = key => {
        setActiveTabKey(key);
    };

    return (
        <Card
            style={{ width: 350, height: 300, marginTop: 10 }}
            title="Add/Remove Liquidity"
            tabList={tabList}
            activeTabKey={activeTabKey}
            onTabChange={key => {
                onTabChange(key);
            }}
        >
            {contentList[activeTabKey]}
        </Card>
    )
}