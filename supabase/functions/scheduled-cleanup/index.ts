
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// This function will trigger the cleanup edge function
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Triggering cleanup for rejected documents");
    
    // Call the cleanup edge function
    const response = await fetch(`${req.url.split('/scheduled-cleanup')[0]}/cleanup-rejected-documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    
    const result = await response.json();
    console.log("Cleanup result:", result);
    
    return new Response(
      JSON.stringify({ success: true, message: "Cleanup triggered successfully", result }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error triggering cleanup:", error);
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
