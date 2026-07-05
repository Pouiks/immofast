// Exécute des fichiers .sql sur la base Supabase (connexion postgres directe).
// Usage : node scripts/db-run.mjs [fichier.sql ...]
// Sans argument : simple test de connectivité (SELECT 1).
//
// Connexion résolue dans l'ordre :
//   1) DATABASE_URL (ex. chaîne du pooler copiée depuis le dashboard)
//   2) construite depuis .env.local : db.<ref>.supabase.co + SUPABASE_DB_PASSWORD
import { readFileSync } from "node:fs";
import { Client } from "pg";

function loadEnv(path) {
  const env = {};
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m) env[m[1]] = m[2];
    }
  } catch {}
  return env;
}

const env = { ...loadEnv(".env.local"), ...process.env };

function connectionConfig() {
  if (env.DATABASE_URL) {
    return { connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } };
  }
  const ref = (env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https:\/\/([^.]+)\./)?.[1];
  if (!ref || !env.SUPABASE_DB_PASSWORD) {
    throw new Error("Renseignez DATABASE_URL, ou NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD dans .env.local");
  }
  return {
    host: env.PGHOST || `db.${ref}.supabase.co`,
    port: Number(env.PGPORT || 5432),
    user: env.PGUSER || "postgres",
    password: env.SUPABASE_DB_PASSWORD,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  };
}

const files = process.argv.slice(2);
const client = new Client(connectionConfig());

try {
  await client.connect();
  if (files.length === 0) {
    const { rows } = await client.query("select version()");
    console.log("✓ Connecté :", rows[0].version.split(",")[0]);
  }
  for (const file of files) {
    process.stdout.write(`→ ${file} … `);
    await client.query(readFileSync(file, "utf8"));
    console.log("ok");
  }
} catch (err) {
  console.error("✗ Échec :", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
