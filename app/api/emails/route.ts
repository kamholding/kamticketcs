// C:\Next\kam\kam_ticket_latest\app\api\emails\route.ts
import { NextResponse } from "next/server";
import { sendEmail } from "@/app/utils/mail.utils";

// helper: talk to backend DB API
async function updateTicketStatus(ticketId: number, status: string) {
  console.log(`🔄 Updating ticket ${ticketId} status → ${status}`);
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/${ticketId}/status`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    console.error(`❌ Failed to update ticket ${ticketId} status`);
    throw new Error(`Failed to update ticket ${ticketId} status`);
  }

  console.log(`✅ Ticket ${ticketId} status updated to ${status}`);
  return response.json();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Incoming /api/emails request:", body);

    const { sender, reciepients, subject, message, template, templateData, action } = body;

    // 🔹 Case 1: Normal email (welcome, assigned, etc.)
    if (!action) {
      console.log("✉️ Processing standard email send...");
      if (!sender || !reciepients || !subject || (!message && !template)) {
        console.error("❌ Missing required email fields");
        return NextResponse.json(
          { success: false, error: "Missing required email fields" },
          { status: 400 }
        );
      }

      const response = await sendEmail({
        sender,
        reciepients,
        subject,
        message,
        template,
        templateData,
      });

      console.log("✅ Email sent successfully:", response?.messageId || response);
      return NextResponse.json({ success: true, message: "Email sent!", response });
    }

    // 🔹 Case 2: Handle special action = "resolve_ticket"
    if (action === "resolve_ticket") {
      const { ticketId, user } = templateData || {};
      console.log("🛠️ Handling resolve_ticket action for:", templateData);

      if (!ticketId || !user) {
        console.error("❌ Missing ticketId or user in templateData");
        return NextResponse.json(
          { success: false, error: "Missing ticketId or user in templateData" },
          { status: 400 }
        );
      }

      // 1. update ticket status
      await updateTicketStatus(Number(ticketId), "Resolved");

      // 2. send resolved email
      console.log(`✉️ Sending resolved email for ticket ${ticketId} to ${user.email}`);
      const response = await sendEmail({
        sender: {
          name: "CS-Helpdesk System",
          address: "kamwork2019@gmail.com",
        },
        reciepients: [
          {
            name: user.name,
            address: user.email,
          },
        ],
        subject: `Ticket Resolved: ${templateData.title}`,
        template: "ticket_resolved",
        templateData: {
          name: user.name,
          title: templateData.title,
          ticketId: ticketId,
          resolvedBy: templateData.resolvedBy || "Admin",
        },
      });

      console.log("✅ Ticket resolved email sent:", response?.messageId || response);
      return NextResponse.json({
        success: true,
        message: `Ticket ${ticketId} resolved and email sent`,
        response,
      });
    }

    console.error("❌ Unknown action:", action);
    return NextResponse.json(
      { success: false, error: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    const err = error as Error;
    console.error("❌ API /emails error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
