
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequestBody {
  achievementId: string;
  rejectionReason: string;
  teacherEmail?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { achievementId, rejectionReason, teacherEmail } = await req.json() as EmailRequestBody;

    if (!achievementId || !rejectionReason) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create a Supabase client with the Supabase URL and service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get achievement details if teacherEmail is not provided
    let achievement;
    let email;
    
    if (!teacherEmail) {
      const { data, error } = await supabase
        .from("detailed_achievements")
        .select(`
          title,
          teacher_details (
            email_id,
            full_name
          )
        `)
        .eq("id", achievementId)
        .single();

      if (error) {
        console.error("Error fetching achievement details:", error);
        throw new Error("Failed to fetch achievement details");
      }

      achievement = data;
      email = achievement.teacher_details.email_id;
    } else {
      const { data, error } = await supabase
        .from("detailed_achievements")
        .select("title")
        .eq("id", achievementId)
        .single();

      if (error) {
        console.error("Error fetching achievement title:", error);
        throw new Error("Failed to fetch achievement title");
      }

      achievement = data;
      email = teacherEmail;
    }

    // Update the rejection reason in the database
    const { error: updateError } = await supabase
      .from("detailed_achievements")
      .update({ rejection_reason: rejectionReason })
      .eq("id", achievementId);

    if (updateError) {
      console.error("Error updating rejection reason:", updateError);
      throw new Error("Failed to update rejection reason");
    }

    // Send email
    // In a production environment, you would integrate with an email service
    // like SendGrid, Mailgun, or Amazon SES
    console.log(`Sending email to ${email}`);
    console.log(`Subject: Achievement Rejection Notification`);
    console.log(`Body: Your achievement "${achievement.title}" was rejected due to: ${rejectionReason}`);

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email would be sent to ${email}` 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
