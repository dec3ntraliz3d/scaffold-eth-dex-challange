import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/dec3ntraliz3d" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="Simple Dex"
        subTitle="by @dec3ntraliz3d"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
