import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Get a database connection using the Cloudflare D1 database
 * This function should be called within API routes or server components
 * that have access to the Cloudflare context
 */
export function getDb() {
  const cloudflareContext = getCloudflareContext();
  return drizzle(cloudflareContext.env.DB);
}
