import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oacupgyopcjnrjncjcra.supabase.co";
const SUPABASE_KEY = "sb_publishable_mR7yeFZpND770NV8SAdnAA_YpQ3HM13";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper to slugify
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

console.log("Starting generation of 300 real São Paulo venues...");
