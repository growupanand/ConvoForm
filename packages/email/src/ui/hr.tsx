import { Hr as ReactEmailHr } from "@react-email/components";
import type * as React from "react";

interface HrProps {
  style?: React.CSSProperties;
}

export const Hr = ({ style }: HrProps) => {
  return <ReactEmailHr style={{ ...hr, ...style }} />;
};

const hr = {
  borderColor: "#e6e6e6",
  margin: "20px 0",
};
