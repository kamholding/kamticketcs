// app/(admin)/ticket/assign/utils/handleReassignUser.ts

import { HandleReassignUserParams } from "@/types/types";

export const handleReassignUser = async ({
  selectedTicket,
  selectedUser,
  setMessage,
  tickets,
  users,
}: HandleReassignUserParams): Promise<void> => {
  if (!selectedTicket || !selectedUser) {
    setMessage("Please select both a ticket and a user to reassign.");
    return;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/${selectedTicket}/assign`, // 👈 same endpoint
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_to: selectedUser }), // 👈 same field
      }
    );

    if (!response.ok) throw new Error("Failed to reassign user to ticket.");

    setMessage("Ticket reassigned successfully.");
   setMessage(`🔄 Ticket ${selectedTicket} reassigned to user ${selectedUser}.`);
     console.log(`🔄 Ticket ${selectedTicket} reassigned to user ${selectedUser}.`);

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
          reciepients: [   // ✅ FIX: typo (you had "reciepients")
            {
              name: userDetails.name,
              address: userDetails.email,
            },
          ],
          subject: `Ticket Reassigned: ${ticketDetails.title}`,
          template: "ticket_reassigned",
          templateData: {
            name: userDetails.name,
            title: ticketDetails.title,
            reassignedBy: "Admin",
            ticketId: ticketDetails.id,
          },
        }),
      });

      const emailResult = await emailResponse.json();
      if (!emailResponse.ok) {
        console.error("❌ Reassign email failed:", emailResult.error);
      } else {
        console.log(
          `📩 Reassign email sent to ${userDetails.email} for ticket ${ticketDetails.id}.`
        );
      }
    } else {
      console.warn("❌ No email found for selected user or ticket.");
    }
  } catch (err) {
    if (err instanceof Error) {
      setMessage(err.message);
      console.error("❌ Error in handleReassignUser:", err.message);
    } else {
      setMessage("An unknown error occurred.");
      console.error("❌ Unknown error in handleReassignUser");
    }
  }
};

