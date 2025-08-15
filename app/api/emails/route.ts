// C:\Next\kam\kam_ticket_latest\app\api\emails\route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sender, reciepients, subject, message, template, templateData } = await req.json();

    if (!sender || !reciepients || !subject || (!message && !template)) {
      return NextResponse.json(
        { success: false, error: "Missing required email fields" },
        { status: 400 }
      );
    }

    // ⏳ Lazy load only when needed
    const { sendEmail } = await import("@/app/utils/mail.utils");

    const response = await sendEmail({
      sender,
      reciepients,
      subject,
      message,
      template,
      templateData,
    });

    return NextResponse.json({ success: true, message: "Email sent!", response });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
