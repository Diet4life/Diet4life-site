import { getDatabase } from "@netlify/database";
import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import * as schema from "../../../db/schema";

export type Db = ReturnType<typeof drizzleNodePostgres<typeof schema>>;

// @netlify/database resolves the connection (NETLIFY_DB_URL /
// NETLIFY_DB_DRIVER, injected automatically by Netlify -- never set by hand)
// and hands back a raw pg-compatible pool. We wrap that pool with the
// schema-typed Drizzle ORM client so server code gets full type safety
// instead of hand-written SQL strings.
export function getDb(): Db {
  const connection = getDatabase();
  // drizzle-orm@1.0.0-beta's config-object API: passing the pool
  // positionally (drizzle(pool, config), the pre-1.0 signature) is silently
  // misread as a connection config and constructs a brand new, unconfigured
  // pool (defaulting to 127.0.0.1:5432) instead of reusing the one we pass.
  // Confirmed against the installed driver.cjs -- the pool must be passed
  // as the named `client` property.
  if (connection.driver === "serverless") {
    return drizzleNeon({ client: connection.pool, schema }) as unknown as Db;
  }
  return drizzleNodePostgres({ client: connection.pool, schema });
}
