import { render } from "@react-email/render";
import React from "react";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

import { WelcomeEmail } from "../emails/WelcomeEmail";
import { TicketSubmissionEmail } from "../emails/TicketSubmissionEmail";
import { TicketAssignedEmail } from "../emails/TicketAssignedEmail";
import { TicketResolvedEmail } from "../emails/TicketResolvedEmail";
import { TicketCommentEmail } from "../emails/TicketCommentEmail";

interface TemplateDataMap {
  welcome: { name: string };
  ticket_submission: { name: string; title: string; details: string; ticketId: string };
  ticket_assigned: { name: string; title: string; assignedBy: string; ticketId: string };
  ticket_resolved: { name: string; title: string; ticketId: string; resolvedBy: string };
  ticket_comment: { assigneeName: string; commenterName: string; ticketTitle: string; comment: string; ticketLink: string };
}

type TemplateKey = keyof TemplateDataMap;

type SendEmailDto<T extends TemplateKey | undefined = undefined> = {
  sender: Mail.Address;
  reciepients: Mail.Address[];
  subject: string;
  message?: string;
  template?: T;
  templateData?: T extends TemplateKey ? TemplateDataMap[T] : never;
};

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.NODE_ENV !== "development",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
} as SMTPTransport.Options);

export const sendEmail = async <T extends TemplateKey | undefined = undefined>(
  dto: SendEmailDto<T>
) => {
  try {
    const { sender, reciepients, subject, message, template, templateData } = dto;
    let htmlContent = message || "";

    switch (template) {
      case "welcome": {
        const data = templateData as TemplateDataMap["welcome"];
        htmlContent = await render(<WelcomeEmail name={data.name} />);
        break;
      }
      case "ticket_submission": {
        const data = templateData as TemplateDataMap["ticket_submission"];
        htmlContent = await render(<TicketSubmissionEmail {...data} />);
        break;
      }
      case "ticket_assigned": {
  const data = templateData as TemplateDataMap["ticket_assigned"];
  htmlContent = await render(
    <TicketAssignedEmail
      {...data}
      ticketId={Number(data.ticketId)}
    />
  );
  break;
}
case "ticket_resolved": {
  const data = templateData as TemplateDataMap["ticket_resolved"];
  htmlContent = await render(
    <TicketResolvedEmail
      {...data}
      ticketId={Number(data.ticketId)}
    />
  );
  break;
}

      case "ticket_comment": {
        const data = templateData as TemplateDataMap["ticket_comment"];
        htmlContent = await render(<TicketCommentEmail {...data} />);
        break;
      }
    }

    console.log(
      "📤 Sending email to:",
      reciepients.map((r) => `"${r.name}" <${r.address}>`).join(", ")
    );

    const result = await transport.sendMail({
      from: `"${sender.name}" <${sender.address}>`,
      to: reciepients.map((r) => `"${r.name}" <${r.address}>`).join(", "),
      subject,
      html: htmlContent,
      text: htmlContent.replace(/<\/?[^>]+(>|$)/g, ""),
    });

    console.log("✅ Email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};
