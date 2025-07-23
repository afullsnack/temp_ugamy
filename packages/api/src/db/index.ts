import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import env from "@/env";

import * as authSchema from "./schema/auth-schema";
import * as schema from "./schema/schema";

const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client, {
  schema: { schema, authSchema },
});

export default db;
