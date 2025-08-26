// app/(admin)/ticket/status/utils/handleResolveTicket.ts

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Ticket {
  id: number;
  title: string;
  status: string;
  details: string;
  assigned_to?: number | null;
}

interface HandleResolveParams {
  selectedTicket: number | undefined;
  setMessage: (msg: string) => void;
  tickets: Ticket[];
  users: User[];
}

export const handleResolveTicket = async (
  ticketId: number,
  user: User,
  title: string
) => {
  try {
    console.log("🚀 Resolving ticket:", { ticketId, user, title });

    const res = await fetch("/api/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "resolve_ticket",
        templateData: {
          ticketId,
          user,
          title,
          resolvedBy: "Admin",
        },
      }),
    });

    console.log("📨 Email API response status:", res.status);

    const result = await res.json();
    console.log("📨 Email API response body:", result);

    if (!res.ok) throw new Error(result.error);

    console.log("✅ Ticket resolved + email sent successfully");
  } catch (err) {
    console.error("❌ handleResolveTicket error:", err);
  }
};

