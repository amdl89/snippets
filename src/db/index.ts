import "dotenv/config";
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

const db = drizzle({ client: sql, schema });

export type DB = typeof db;

export default db;
