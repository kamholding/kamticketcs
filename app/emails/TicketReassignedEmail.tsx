import * as React from "react";

interface TicketReassignedEmailProps {
  name: string;
  title: string;
  reassignedBy: string;
  ticketId: number;
}

export const TicketReassignedEmail = ({ name, title, reassignedBy, ticketId }: TicketReassignedEmailProps) => (
  <div>
    <h2>Ticket Reassigned</h2>
    <p>Hello {name},</p>
    <p>Your ticket <strong>#{ticketId} - {title}</strong> has been reassigned by {reassignedBy}.</p>
    <p>Please check your dashboard for more details.</p>
  </div>
);
