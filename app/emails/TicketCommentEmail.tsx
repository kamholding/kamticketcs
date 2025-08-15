// emails/TicketCommentEmail.tsx
import { Heading, Text, Link, Section, Button } from "@react-email/components";
import { EmailLayout } from "@/components/emails/EmailLayouts.tsx";

type TicketCommentEmailProps = {
  assigneeName: string;
  commenterName: string;
  ticketTitle: string;
  comment: string;
  ticketLink: string;
};

export const TicketCommentEmail = ({
  assigneeName,
  commenterName,
  ticketTitle,
  comment,
  ticketLink,
}: TicketCommentEmailProps) => (
  <EmailLayout>
    <Heading style={{ textAlign: "center", color: "#333" }}>
      New Comment on Your Assigned Ticket
    </Heading>
    <Text>Hi {assigneeName},</Text>
    <Text>
      <strong>{commenterName}</strong> added a comment to <strong>{ticketTitle}</strong>.
    </Text>
    <Section
      style={{
        backgroundColor: "#f9fafb",
        padding: "15px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        marginTop: "15px",
      }}
    >
      <Text style={{ fontStyle: "italic", color: "#333" }}>
        "{comment}"
      </Text>
    </Section>
    <Section style={{ textAlign: "center", marginTop: "20px" }}>
      <Button
        href={ticketLink}
        style={{
          backgroundColor: "#007bff",
          padding: "10px 20px",
          borderRadius: "5px",
          color: "#fff",
          textDecoration: "none",
        }}
      >
        View Ticket
      </Button>
    </Section>
    <Text style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
      If you have questions, <Link href="mailto:support@yourapp.com">contact support</Link>.
    </Text>
  </EmailLayout>
);
