import { SQL } from "bun";

const password = process.env.DATABASE_PASSWORD || "On_agencia_2002";
const projectRef = process.env.SUPABASE_PROJECT_ID || "oacupgyopcjnrjncjcra";

const connStr = `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;

const ddl = `
-- PROFILES TABLE FOR CLIENTS & PARTNERS
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'partner', 'admin')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  business_name TEXT,
  venue_category TEXT CHECK (venue_category IN ('baladas', 'restaurantes', 'moteis')),
  neighborhood TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;
CREATE POLICY "Anyone can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);
`;

async function main() {
  console.log("Connecting to Supabase...");
  const sql = new SQL(connStr);
  console.log("Creating public.profiles table...");
  await sql.unsafe(ddl);
  console.log("SUCCESS: public.profiles table created with RLS policies!");
}

main().catch((err) => {
  console.error("Error creating profiles table:", err);
  process.exit(1);
});
