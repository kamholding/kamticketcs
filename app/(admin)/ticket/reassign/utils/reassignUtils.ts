export const reassignUserToTicket = async (ticketId: any, userId: any): Promise<string> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/${ticketId}/reassign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_assigned_to: userId }),
    });

    if (!response.ok) {
        throw new Error('Failed to reassign user to ticket.');
    }

    return 'Ticket reassigned successfully.';
};

export const handleReassignUser = async ({
    selectedTicket,
    selectedUser,
    setMessage,
    tickets,
    users,
}: {
    selectedTicket: any;
    selectedUser: any;
    setMessage: (msg: string) => void;
    tickets: any[];
    users: any[];
}) => {
    if (!selectedTicket || !selectedUser) {
        setMessage('Please select both a ticket and a new user.');
        return;
    }

    try {
        const msg = await reassignUserToTicket(selectedTicket, selectedUser);
        setMessage(msg);

        const userDetails = users.find(u => u.id === selectedUser);
        const ticketDetails = tickets.find(t => t.id === selectedTicket);

        if (userDetails?.email) {
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
                    subject: `Ticket reassigned to you: ${ticketDetails.title}`,
                    template: "ticket_assigned",
                    templateData: {
                        name: userDetails.name,
                        title: ticketDetails.title,
                        assignedBy: "Admin",
                        ticketId: ticketDetails.id,
                    },
                }),
            });

            const result = await emailResponse.json();
            if (!emailResponse.ok) {
                console.error("Failed to send reassignment email:", result.error);
            } else {
                console.log("✅ Reassignment email sent:", result);
            }
        } else {
            console.warn("User email missing, could not send email.");
        }

    } catch (err: any) {
        setMessage(err.message);
    }
};
