import { SQL } from "bun";

const password = process.env.DATABASE_PASSWORD || "On_agencia_2002";
const projectRef = process.env.SUPABASE_PROJECT_ID || "oacupgyopcjnrjncjcra";
const connStr = `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;

async function main() {
  const sql = new SQL(connStr);
  console.log("Seeding Super Admin user into Supabase...");
  
  await sql`
    INSERT INTO public.profiles (
      id, name, email, whatsapp, role, business_name, neighborhood
    ) VALUES (
      'admin-thiago',
      'Thiago (Super Admin Oficial)',
      'thiagooriginal2002@gmail.com',
      '(11) 98765-4321',
      'admin',
      'Radar do Rolê Master HQ',
      'São Paulo - SP'
    ) ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      name = 'Thiago (Super Admin Oficial)',
      email = 'thiagooriginal2002@gmail.com';
  `;

  const adminProfiles = await sql`
    SELECT * FROM public.profiles WHERE role = 'admin';
  `;
  console.log("SUPER ADMIN PROFILE CONFIGURED:", adminProfiles);
}

main().catch(console.error);
