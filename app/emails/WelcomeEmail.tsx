// emails/WelcomeEmail.tsx
import { Heading, Text, Link, Section, Button } from "@react-email/components";
import { EmailLayout } from "@/components/emails/EmailLayouts";

export const WelcomeEmail = ({ name }: { name: string }) => (
  <EmailLayout>
    <Heading style={{ textAlign: "center", color: "#333" }}>
      Welcome to Our Platform!
    </Heading>
    <Text>Dear {name},</Text>
    <Text>
      We are excited to have you on board! Your account has been created
      successfully.
    </Text>
  </EmailLayout>
);
