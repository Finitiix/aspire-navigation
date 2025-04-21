
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendTeacherEmailRequest {
  email: string;
  teacherName: string;
  type: "approved" | "rejected";
  reason?: string;
  document: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      teacherName,
      type,
      reason,
      document,
    }: SendTeacherEmailRequest = await req.json();

    const title = document?.title ?? "Achievement";

    let subject = "";
    let html = "";

    if (type === "approved") {
      subject = `🎉 Your Document "${title}" Has Been Approved!`;
      html = `
        <h2 style="color:green">🎉 Congratulations, ${teacherName}!</h2>
        <p>Your document "<strong>${title}</strong>" has been <b>approved</b> successfully.</p>
        <h4>Document Details:</h4>
        <ul>
          <li><b>Category:</b> ${document?.category ?? "-"}</li>
          <li><b>Title:</b> ${title}</li>
          <li><b>Date Achieved:</b> ${document?.date_achieved ?? "-"}</li>
          <li><b>Remarks:</b> ${document?.remarks ?? "-"}</li>
        </ul>
        <p>Enjoy your recognition! 🎊</p>
      `;
    } else {
      subject = `❌ Your Document "${title}" Has Been Rejected`;
      html = `
        <h2 style="color:red">❌ Hello, ${teacherName}</h2>
        <p>Your document "<strong>${title}</strong>" was <b>rejected</b>.</p>
        <h4>Reason for Rejection:</h4>
        <blockquote style="color:#b91c1c">${reason ?? "No reason provided."}</blockquote>
        <h4>Document Details:</h4>
        <ul>
          <li><b>Category:</b> ${document?.category ?? "-"}</li>
          <li><b>Title:</b> ${title}</li>
          <li><b>Date Achieved:</b> ${document?.date_achieved ?? "-"}</li>
          <li><b>Remarks:</b> ${document?.remarks ?? "-"}</li>
        </ul>
        <p>If you have questions, please reach out to your admin.</p>
      `;
    }

    const response = await resend.emails.send({
      from: "Admin <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    });

    return new Response(JSON.stringify({ success: true, response }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending teacher email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
