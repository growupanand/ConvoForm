import { Text as ReactEmailText } from "@react-email/components";
import type * as React from "react";

interface TextProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Text = ({ children, style }: TextProps) => {
  return (
    <ReactEmailText style={{ ...text, ...style }}>{children}</ReactEmailText>
  );
};

const text = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
};
