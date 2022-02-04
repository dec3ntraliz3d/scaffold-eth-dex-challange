import { SyncOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import { Button, Card, Divider, Input, Select, Row, Col, Space } from "antd";
import "antd/dist/antd.css";
import React, { useState, useEffect } from "react";
import { Address, Balance, Events } from "../components";
import Swap from "../components/Dex/Swap";
import Liquidity from "../components/Dex/Liquidity";
import {
  useContractLoader,
  useContractReader,
  useBalance
} from "eth-hooks";
import Curve from "../components/Dex/Curve";
import Layout from "antd/lib/layout/layout";


const { Option } = Select;

export default function ExampleUI({

  address,
  userSigner,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  writeContracts,
  readContracts,
  contractConfig,
  chainId
}) {

  const contracts = useContractLoader(localProvider, contractConfig, chainId);

  // Get user balances.

  const userEthBalance = useBalance(localProvider, address)

  const userTokenBalance = useContractReader(
    readContracts,
    "Balloons",
    "balanceOf",
    [address]

  )


  const dexAddress = readContracts?.Dex?.address;
  const dexEthBalance = useBalance(localProvider, dexAddress);
  const dexTokenBalance = useContractReader(
    readContracts,
    "Balloons",
    "balanceOf",
    [dexAddress]
  )



  return (
    <Row>
      <Col span={6} />

      <Col span={6}>
        {/* <div style={{ padding: 8, marginTop: 32, width: 400, margin: "auto" }}> */}
        {/* <Space size={"large"}> */}
        <Swap
          readContracts={readContracts}
          writeContracts={writeContracts}
          localProvider={localProvider}
          tx={tx}
          address={address}
        // userEthBalance={userEthBalance}
        // userTokenBalance={userTokenBalance}
        // dexEthBalance={dexEthBalance}
        // dexTokenBalance={dexTokenBalance}
        />
        {/* </div> */}
      </Col>
      <Col span={6}>
        {/* <div style={{ padding: 8, marginTop: 32, width: 400, margin: "auto" }}> */}
        <Liquidity
          style={{ marginTop: 0 }}
          readContracts={readContracts}
          writeContracts={writeContracts}
          localProvider={localProvider}
          tx={tx}
          address={address}
          dexEthBalance={dexEthBalance}
          dexTokenBalance={dexTokenBalance}
          userEthBalance={userEthBalance}
          userTokenBalance={userTokenBalance}
        />


        {/* </Space> */}

        {/* </div> */}
      </Col>
      <Col span={6} />

      {/* <div
        style={{
          padding: 8,
          marginTop: 50,
          width: 600,
          margin: "auto",


        }}>
        <Curve
          addingEth={0}
          addingToken={0}
          ethReserve={dexEthBalance ? ethers.utils.formatEther(dexEthBalance) : 0}
          tokenReserve={dexTokenBalance ? ethers.utils.formatEther(dexTokenBalance) : 0}
          width={300}
          height={300}
        />
      </div> */}
    </Row>
  );
}
