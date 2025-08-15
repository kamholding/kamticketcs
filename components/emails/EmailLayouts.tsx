// C:\Next\kam\kam_ticket_latest\components\emails\EmailLayouts.tsx
import {
  Html,
  Head,
  Body,
  Container,
} from "@react-email/components";
import React from "react";

const baseBodyStyle = {
  backgroundColor: "#f3f4f6",
  padding: "20px",
};

const baseContainerStyle = {
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  padding: "20px",
  borderRadius: "10px",
};

type EmailLayoutProps = {
  children: React.ReactNode;
  bodyBg?: string;
};

export const EmailLayout = ({ children, bodyBg }: EmailLayoutProps) => (
  <Html>
    <Head />
    <Body style={{ ...baseBodyStyle, backgroundColor: bodyBg || baseBodyStyle.backgroundColor }}>
      <Container style={baseContainerStyle}>{children}</Container>
    </Body>
  </Html>
);
