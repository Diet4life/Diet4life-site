import { getDatabase, MissingDatabaseConnectionError } from "@netlify/database";
import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import * as schema from "../../../db/schema";

export type Db = ReturnType<typeof drizzleNodePostgres<typeof schema>>;

// Thrown when no usable connection string was found anywhere (neither
// process.env.NETLIFY_DB_URL nor @netlify/database's own internal
// resolution). Deliberately never includes the connection string itself --
// only ever references the env var by name.
export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "NETLIFY_DB_URL is not available in this runtime. Netlify Database must be provisioned/linked for this deploy context (Site settings -> Environment variables) before any DB-backed function can run.",
    );
    this.name = "DatabaseNotConfiguredError";
  }
}

// @netlify/database's own getDatabase() resolves NETLIFY_DB_URL through
// @netlify/runtime-utils's getEnvironment(), which reads from a
// globalThis.Netlify.env accessor when present and only falls back to
// process.env when that global is absent. On this project's Netlify
// Functions (classic Node functions, esbuild-bundled -- not Edge
// Functions), that global is not reliably populated on every deploy
// context: branch deploys threw MissingDatabaseConnectionError from
// listActiveProducts()/getDb() even though process.env.NETLIFY_DB_URL was
// actually set on the container and the branch's database was healthy.
//
// Reading process.env.NETLIFY_DB_URL directly here and passing it as the
// explicit `connectionString` override sidesteps that globalThis.Netlify
// layer entirely for the case that matters. It changes nothing else:
// getDatabase() only consults its own internal resolution (which still
// tries the globalThis.Netlify.env path, then process.env) when the
// override we pass is undefined -- so local/dev, or any context where the
// value truly isn't on process.env, keeps working exactly as it did
// before this fix.
export function getDb(): Db {
  let connection: ReturnType<typeof getDatabase>;
  try {
    connection = getDatabase({ connectionString: process.env.NETLIFY_DB_URL });
  } catch (err) {
    if (err instanceof MissingDatabaseConnectionError) {
      throw new DatabaseNotConfiguredError();
    }
    throw err;
  }
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
