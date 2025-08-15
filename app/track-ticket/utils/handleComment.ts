type CommentProps = {
  ticketId: string;
  content: string;
  setNewComments: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  fetchComments: (ticketId: string) => Promise<void>;
  setMessage?: (msg: string) => void;
  email: string;
  API_BASE: string;
};

export const handleAddComment = async ({
  ticketId,
  content,
  setNewComments,
  fetchComments,
  setMessage,
  email,
  API_BASE,
}: CommentProps) => {
  if (!content?.trim()) return;

  try {
    // 1. Save comment
    const res = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_id: ticketId, content })
    });

    if (!res.ok) throw new Error("Failed to post comment");

    setNewComments(prev => ({ ...prev, [ticketId]: '' }));
    await fetchComments(ticketId);

    // 2. Fetch ticket details to get assignee info
    const ticketRes = await fetch(`${API_BASE}/tickets/${ticketId}`);
    const ticketData = await ticketRes.json();

    const assigneeName = ticketData?.assignee?.name || "Assignee";
    const assigneeEmail = ticketData?.assignee?.email;
    const ticketTitle = ticketData?.title || "Untitled Ticket";
    const ticketLink = `${window.location.origin}/dashboard/tickets/${ticketId}`;
    const commenterName = email;

    // 3. Send email
    await fetch("/api/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "Support Bot", address: "no-reply@yourapp.com" },
        reciepients: [{ name: assigneeName, address: assigneeEmail || "support@example.com" }],
        subject: `New comment on ticket: ${ticketTitle}`,
        template: "ticket_comment",
        templateData: {
          assigneeName,
          commenterName,
          ticketTitle,
          comment: content,
          ticketLink
        }
      })
    });

    setMessage?.("Comment added and notification sent.");
  } catch (err) {
    console.error("Error posting comment or sending email", err);
    setMessage?.("Something went wrong while adding the comment.");
  }
};
