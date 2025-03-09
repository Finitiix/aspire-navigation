
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RejectionEmailRequest {
  achievementId: string;
  teacherId: string;
  achievementTitle: string;
  rejectionReason: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { achievementId, teacherId, achievementTitle, rejectionReason }: RejectionEmailRequest = await req.json();
    
    if (!achievementId || !teacherId || !achievementTitle || !rejectionReason) {
      throw new Error("Missing required parameters");
    }

    console.log(`Sending rejection email for achievement: ${achievementId}`);

    // Get teacher email from teacher_details
    const { data: teacherData, error: teacherError } = await supabase
      .from("teacher_details")
      .select("email_id, full_name")
      .eq("id", teacherId)
      .single();

    if (teacherError || !teacherData) {
      throw new Error(`Error fetching teacher details: ${teacherError?.message || "Teacher not found"}`);
    }

    const teacherEmail = teacherData.email_id;
    const teacherName = teacherData.full_name;

    console.log(`Sending email to: ${teacherEmail}`);

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Achievements Portal <onboarding@resend.dev>",
      to: [teacherEmail],
      subject: "Achievement Submission Rejected",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1EAEDB;">Achievement Rejection Notification</h2>
          <p>Dear ${teacherName},</p>
          <p>We regret to inform you that your achievement submission has been rejected.</p>
          <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #1EAEDB; background-color: #f9f9f9;">
            <p><strong>Achievement Title:</strong> ${achievementTitle}</p>
            <p><strong>Reason for Rejection:</strong> ${rejectionReason}</p>
          </div>
          <p>You can review and update your submission through the teacher portal.</p>
          <p>If you have any questions or need assistance, please contact the administration.</p>
          <p>Best regards,<br>Achievements Portal Admin</p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, message: "Rejection email sent" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending rejection email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
