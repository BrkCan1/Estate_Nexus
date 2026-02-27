import { createClient } from "@supabase/supabase-js";

// Supabase panelinden Settings -> API bölümündeki bilgileri buraya gir:
const supabaseUrl = "https://hjsumasubgssdaapqqdg.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqc3VtYXN1Ymdzc2RhYXBxcWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwODUzNDUsImV4cCI6MjA4MjY2MTM0NX0.NN3jjpyWYjATXaTL5iqlfW9MBvIuzWb3ajqRwKzkgOA";

export const supabase = createClient(supabaseUrl, supabaseKey);
