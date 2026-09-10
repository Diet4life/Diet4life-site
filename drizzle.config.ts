import { defineConfig } from "drizzle-kit";

// NETLIFY_DB_URL is the current Netlify Database runtime variable (read by
// @netlify/database's getConnectionString()/getDatabase()). The legacy
// NETLIFY_DATABASE_URL name is deliberately not used here.
export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "netlify/database/migrations",
  dbCredentials: {
    url: process.env.NETLIFY_DB_URL!,
  },
});
