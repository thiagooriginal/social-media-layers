import { SQL } from "bun";
import * as fs from "fs";
import * as path from "path";

const password = process.env.DATABASE_PASSWORD || "";
const projectRef = process.env.SUPABASE_PROJECT_ID || "oacupgyopcjnrjncjcra";

// Connection strings to try:
// 1. Direct connection
// 2. Pooler session mode
// 3. Pooler transaction mode
const connectionStrings = [
  `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`,
];

async function main() {
  let connectedSql: any = null;

  for (const connStr of connectionStrings) {
    try {
      console.log("Trying connection:", connStr.replace(password, "****"));
      const sql = new SQL(connStr);
      const res = await sql`SELECT 1 as test;`;
      console.log("SUCCESS! Connected successfully. Result:", res);
      connectedSql = sql;
      break;
    } catch (err: any) {
      console.log("Failed attempt:", err.message);
    }
  }

  if (!connectedSql) {
    console.error("COULD NOT CONNECT with provided password and connection strings.");
    process.exit(1);
  }

  console.log("Reading supabase_schema.sql...");
  const schemaPath = path.resolve(process.cwd(), "supabase_schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  console.log("Executing schema and seed migrations on Supabase (length: " + schemaSql.length + " bytes)...");
  
  // Execute the SQL schema
  await connectedSql.unsafe(schemaSql);

  console.log("Migration executed successfully!");
  
  // Verify table counts
  const venueCount = await connectedSql`SELECT count(*) FROM public.venues;`;
  const eventCount = await connectedSql`SELECT count(*) FROM public.events;`;
  console.log("Venues created:", venueCount);
  console.log("Events created:", eventCount);
}

main().catch((e) => {
  console.error("Migration error:", e);
  process.exit(1);
});
