/**
 * Applies migration 006 (missing columns) to fix PostgreSQL 42703.
 * Requires DATABASE_URL in .env.local (Supabase: Settings → Database → Connection string → URI).
 * Or run the SQL in supabase/migrations/006_ensure_app_columns.sql manually in Supabase SQL Editor.
 */
const { readFileSync } = require("fs");
const { resolve } = require("path");

async function main() {
  const path = resolve(__dirname, "../.env.local");
  let env = {};
  try {
    const content = readFileSync(path, "utf8");
    for (const line of content.split("\n")) {
      const m = line.match(/^\s*([^#=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    console.error("No .env.local found. Add DATABASE_URL or run the SQL manually.");
    process.exit(1);
  }

  const databaseUrl = env.DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(
      "Add DATABASE_URL to .env.local (Supabase Dashboard → Project Settings → Database → Connection string → URI),\n" +
        "then run: npm run db:fix\n\n" +
        "Or run this SQL manually in Supabase → SQL Editor:\n" +
        resolve(__dirname, "../supabase/migrations/006_ensure_app_columns.sql")
    );
    process.exit(1);
  }

  const pg = require("pg");
  const sqlPath = resolve(__dirname, "../supabase/migrations/006_ensure_app_columns.sql");
  const sql = readFileSync(sqlPath, "utf8");
  const statements = sql
    .split(";")
    .map((s) => s.replace(/--.*$/gm, "").trim())
    .filter((s) => s.length > 10);

  const client = new pg.Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    for (const statement of statements) {
      await client.query(statement + ";");
    }
    console.log("Migration applied. Restart the app if it was running.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
