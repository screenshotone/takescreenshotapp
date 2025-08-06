import { createClient } from "@libsql/client";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";

let instance: ReturnType<typeof drizzle> | null = null;

export function db() {
    if (!instance) {
        const client = createClient({
            url: process.env.DATABASE_URL!,
        });
        client.execute("PRAGMA journal_mode = WAL;");

        instance = drizzle(client);
    }

    return instance;
}

export default db;
