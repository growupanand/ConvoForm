import { Button as ReactEmailButton } from "@react-email/components";
import type * as React from "react";

interface ButtonProps {
  children: React.ReactNode;
  href: string;
  style?: React.CSSProperties;
}

export const Button = ({ children, href, style }: ButtonProps) => {
  return (
    <ReactEmailButton style={{ ...button, ...style }} href={href}>
      {children}
    </ReactEmailButton>
  );
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
};
