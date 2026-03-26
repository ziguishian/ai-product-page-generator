const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { resolveSqliteDatabasePath } = require("./runtime-paths.cjs");

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }
    const [key, ...rest] = line.split("=");
    if (!key) continue;
    const value = rest.join("=").trim().replace(/^"(.*)"$/, "$1");
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function resolveDatabasePath() {
  const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
  return resolveSqliteDatabasePath(databaseUrl, {
    cwd: process.cwd(),
    defaultBaseDir: path.resolve(process.cwd(), "prisma"),
  });
}

function ensureMigrationsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS "_banana_mall_migrations" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL UNIQUE,
      "appliedAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function getAppliedMigrations(db) {
  const rows = db.prepare(`SELECT "name" FROM "_banana_mall_migrations"`).all();
  return new Set(rows.map((row) => row.name));
}

function listMigrationFiles() {
  const root = path.resolve(process.cwd(), "prisma", "migrations");
  if (!fs.existsSync(root)) {
    return [];
  }

  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      filePath: path.join(root, entry.name, "migration.sql"),
    }))
    .filter((entry) => fs.existsSync(entry.filePath))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function main() {
  loadEnv();

  const dbPath = resolveDatabasePath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);

  ensureMigrationsTable(db);
  const applied = getAppliedMigrations(db);
  const migrations = listMigrationFiles();

  for (const migration of migrations) {
    if (applied.has(migration.name)) {
      continue;
    }

    const sql = fs.readFileSync(migration.filePath, "utf8");
    db.exec("BEGIN");
    try {
      db.exec(sql);
      db.prepare(`INSERT INTO "_banana_mall_migrations" ("name") VALUES (?)`).run(migration.name);
      db.exec("COMMIT");
      console.log(`Applied migration: ${migration.name}`);
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  db.close();
  console.log(`Database ready at ${dbPath}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
  resolveDatabasePath,
};
