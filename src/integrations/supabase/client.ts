
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tzxxldvukpfyrvwqxbqf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6eHhsZHZ1a3BmeXJ2d3F4YnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDI3NjMsImV4cCI6MjA1NjA3ODc2M30.0yLOQXnExEauBMFaen9pn2Dgc7RF29W3o8eYiFWfg1M";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
