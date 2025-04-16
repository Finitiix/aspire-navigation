
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tzxxldvukpfyrvwqxbqf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6eHhsZHZ1a3BmeXJ2d3F4YnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDI3NjMsImV4cCI6MjA1NjA3ODc2M30.0yLOQXnExEauBMFaen9pn2Dgc7RF29W3o8eYiFWfg1M";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Initialize storage buckets
const initializeStorage = async () => {
  try {
    // Check if the buckets exist
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Error checking storage buckets:", error);
      return;
    }
    
    // Check for "Teacher Information" bucket
    if (!buckets.find(bucket => bucket.name === "teacher_information")) {
      const { error: createError } = await supabase.storage.createBucket(
        "teacher_information", 
        { public: true }
      );
      
      if (createError) {
        console.error("Error creating Teacher Information bucket:", createError);
      } else {
        console.log("Created Teacher Information bucket");
      }
    }
    
    // Check for "Teacher Proofs" bucket
    if (!buckets.find(bucket => bucket.name === "teacher_proofs")) {
      const { error: createError } = await supabase.storage.createBucket(
        "teacher_proofs", 
        { public: true }
      );
      
      if (createError) {
        console.error("Error creating Teacher Proofs bucket:", createError);
      } else {
        console.log("Created Teacher Proofs bucket");
      }
    }
  } catch (error) {
    console.error("Storage initialization error:", error);
  }
};

// Call the initialization function
initializeStorage();
