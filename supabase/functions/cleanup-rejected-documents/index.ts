
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Running cleanup for rejected documents older than 7 days");
    
    // Get date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Format date for database comparison
    const formattedDate = sevenDaysAgo.toISOString();
    
    // Find all rejected documents older than 7 days
    const { data: oldRejectedDocs, error: fetchError } = await supabase
      .from("detailed_achievements")
      .select("id")
      .eq("status", "Rejected")
      .lt("created_at", formattedDate);
    
    if (fetchError) {
      throw new Error(`Error fetching rejected documents: ${fetchError.message}`);
    }

    console.log(`Found ${oldRejectedDocs?.length || 0} rejected documents older than 7 days`);
    
    // If no documents to delete, return early
    if (!oldRejectedDocs?.length) {
      return new Response(
        JSON.stringify({ success: true, message: "No old rejected documents to delete", deleted: 0 }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Get IDs of documents to delete
    const documentsToDelete = oldRejectedDocs.map(doc => doc.id);
    
    // Delete the documents
    const { error: deleteError } = await supabase
      .from("detailed_achievements")
      .delete()
      .in("id", documentsToDelete);
    
    if (deleteError) {
      throw new Error(`Error deleting rejected documents: ${deleteError.message}`);
    }
    
    console.log(`Successfully deleted ${documentsToDelete.length} old rejected documents`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully deleted ${documentsToDelete.length} old rejected documents`,
        deleted: documentsToDelete.length
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
    
  } catch (error: any) {
    console.error("Error in cleanup function:", error);
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
