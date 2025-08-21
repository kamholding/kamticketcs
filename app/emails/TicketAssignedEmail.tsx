// emails/TicketAssignedEmail.tsx
import { EmailLayout } from "@/components/emails/EmailLayouts";
import { Heading, Text } from "@react-email/components";

type TicketAssignedEmailProps = {
  name: string;
  title: string;
  assignedBy: string;
  ticketId: number;
};

export const TicketAssignedEmail = ({
  name,
  title,
  assignedBy,
  ticketId,
}: TicketAssignedEmailProps) => (
  <EmailLayout>
    <Heading style={{ color: "#333" }}>Hello {name},</Heading>
    <Text>You have been assigned a new support ticket:</Text>
    <ul>
      <li><strong>Ticket ID:</strong> #{ticketId}</li>
      <li><strong>Title:</strong> {title}</li>
      <li><strong>Assigned By:</strong> {assignedBy}</li>
    </ul>
    <Text>Please log in to your dashboard to view more details and begin processing the ticket.</Text>
    <Text>Thank you!</Text>
  </EmailLayout>
);
