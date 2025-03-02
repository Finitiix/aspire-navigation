
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tzxxldvukpfyrvwqxbqf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6eHhsZHZ1a3BmeXJ2d3F4YnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDI3NjMsImV4cCI6MjA1NjA3ODc2M30.0yLOQXnExEauBMFaen9pn2Dgc7RF29W3o8eYiFWfg1M";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Initialize storage bucket for teacher information if needed
const initializeStorage = async () => {
  try {
    // Check if the bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Error checking storage buckets:", error);
      return;
    }
    
    // If the "Teacher Information" bucket doesn't exist, create it
    if (!buckets.find(bucket => bucket.name === "Teacher Information")) {
      const { error: createError } = await supabase.storage.createBucket(
        "Teacher Information", 
        { public: true }
      );
      
      if (createError) {
        console.error("Error creating bucket:", createError);
      } else {
        console.log("Created Teacher Information bucket");
      }
    }
  } catch (error) {
    console.error("Storage initialization error:", error);
  }
};

// Call the initialization function
initializeStorage();
