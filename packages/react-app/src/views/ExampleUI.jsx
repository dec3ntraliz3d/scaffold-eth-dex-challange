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
    <>
      <div style={{ padding: 8, marginTop: 32, width: 900, margin: "auto" }}>
        <Space>
          <Space direction="vertical">
            <Swap
              readContracts={readContracts}
              writeContracts={writeContracts}
              localProvider={localProvider}
              tx={tx}
              address={address}
            />
            <div
              style={{
                padding: 8,
                marginTop: 50,
                width: 600,
                margin: "auto",


              }}>

            </div>
          </Space>

          <Liquidity
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
        </Space>


      </div>
      {/* This div will be used to show the curve */}
      {/* <div
        style={{
          padding: 8,
          marginTop: 100,
          width: 600,
          margin: "auto",
          backgroundColor: "green"
        }}>
      </div> */}
    </>
  );
}
