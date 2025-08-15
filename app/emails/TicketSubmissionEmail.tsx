// C:\Next\kam\kam_ticket_latest\app\emails\TicketSubmissionEmail.tsx
import { Heading, Text, Section } from "@react-email/components";
import { EmailLayout } from "@/components/emails/EmailLayouts";

export const TicketSubmissionEmail = ({
  name,
  title,
  details,
  ticketId,
}: {
  name: string;
  title: string;
  details: string;
  ticketId: string;
}) => (
  <EmailLayout bodyBg="#f9fafb">
    <Heading style={{ color: "#333", textAlign: "center" }}>New Ticket Submitted</Heading>
    <Text>Dear Admin,</Text>
    <Text>
      <strong>{name}</strong> has submitted a new ticket.
    </Text>
    <Section>
      <Text><strong>Ticket ID:</strong> {ticketId}</Text>
      <Text><strong>Title:</strong> {title}</Text>
      <Text><strong>Details:</strong></Text>
      <Text>{details}</Text>
    </Section>
    <Text style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
      Please log in to the admin dashboard to take action.
    </Text>
  </EmailLayout>
);
