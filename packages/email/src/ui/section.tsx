import { Section as ReactEmailSection } from "@react-email/components";
import type * as React from "react";

interface SectionProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Section = ({ children, style }: SectionProps) => {
  return (
    <ReactEmailSection style={{ ...section, ...style }}>
      {children}
    </ReactEmailSection>
  );
};

const section = {
  padding: "24px",
  border: "1px solid #e6e6e6",
  borderRadius: "5px",
  margin: "20px 0",
};
