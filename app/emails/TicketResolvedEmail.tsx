// emails/TicketResolvedEmail.tsx
import { Heading, Text, Section } from "@react-email/components";
import { EmailLayout } from "@/components/emails/EmailLayouts";

export const TicketResolvedEmail = ({
  name,
  title,
  ticketId,
  resolvedBy,
}: {
  name: string;
  title: string;
  ticketId: number;
  resolvedBy: string;
}) => (
  <EmailLayout bodyBg="#f9fafb">
    <Heading style={{ color: "#333", textAlign: "center" }}>Ticket Resolved</Heading>
    <Text>Hi {name},</Text>
    <Text>
      Your support ticket has been marked as <strong>resolved</strong>.
    </Text>
    <Section>
      <Text><strong>Ticket ID:</strong> #{ticketId}</Text>
      <Text><strong>Title:</strong> {title}</Text>
      <Text><strong>Resolved By:</strong> {resolvedBy}</Text>
    </Section>
    <Text>
      If the issue is not fully resolved, please reach out to the staff via their details on the dashboard.
    </Text>
    <Text style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
      Thank you for using our support service.
    </Text>
  </EmailLayout>
);
