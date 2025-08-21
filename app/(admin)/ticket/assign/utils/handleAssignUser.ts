// app/(admin)/ticket/assign/utils/handleAssignUser.ts

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Ticket {
  id: number;
  title: string;
  subcategory: string;
  details: string;
  image?: string;
}

interface HandleAssignUserParams {
  selectedTicket: number | undefined;
  selectedUser: number | undefined;
  setMessage: (msg: string) => void;
  tickets: Ticket[];
  users: User[];
}

export const handleAssignUser = async ({
  selectedTicket,
  selectedUser,
  setMessage,
  tickets,
  users,
}: HandleAssignUserParams): Promise<void> => {
  if (!selectedTicket || !selectedUser) {
    setMessage("Please select both a ticket and a user.");
    return;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/${selectedTicket}/assign`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_to: selectedUser }),
      }
    );

    if (!response.ok) throw new Error("Failed to assign user to ticket.");
    setMessage("User assigned to ticket successfully.");

    const userDetails = users.find((u) => u.id === selectedUser);
    const ticketDetails = tickets.find((t) => t.id === selectedTicket);

    if (userDetails?.email && ticketDetails) {
      const emailResponse = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: {
            name: "Helpdesk System",
            address: "noreply@yourdomain.com",
          },
          reciepients: [
            {
              name: userDetails.name,
              address: userDetails.email,
            },
          ],
          subject: `You have been assigned a new ticket: ${ticketDetails.title}`,
          template: "ticket_assigned",
          templateData: {
            name: userDetails.name,
            title: ticketDetails.title,
            assignedBy: "Admin",
            ticketId: ticketDetails.id,
          },
        }),
      });

      const emailResult = await emailResponse.json();
      if (!emailResponse.ok) {
        console.error("❌ Email failed:", emailResult.error);
      } else {
        console.log("✅ Email sent:", emailResult);
      }
    } else {
      console.warn("❌ No email found for selected user or ticket.");
    }
  } catch (err) {
    if (err instanceof Error) {
      setMessage(err.message);
    } else {
      setMessage("An unknown error occurred.");
    }
  }
};
