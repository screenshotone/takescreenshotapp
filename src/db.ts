import { Client, createClient, LibsqlError } from "@libsql/client";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { wait } from "./lib/utils";
import { DrizzleQueryError } from "drizzle-orm/errors";

declare global {
    var cachedDb: ReturnType<typeof drizzle> | null;
    var cachedClient: Client | null;
}

export function db(): ReturnType<typeof drizzle> {
    if (globalThis.cachedDb) {
        return globalThis.cachedDb;
    }

    if (!globalThis.cachedDb) {
        globalThis.cachedClient = createClient({
            url: process.env.DATABASE_URL!,
        });

        try {
            globalThis.cachedClient.execute("SELECT 1;");
        } catch (error) {
            if (
                error instanceof LibsqlError &&
                error.code.startsWith("SQLITE_BUSY")
            ) {
                globalThis.cachedClient.close();
                globalThis.cachedClient = createClient({
                    url: process.env.DATABASE_URL!,
                });
            }

            throw error;
        }

        globalThis.cachedClient.execute("PRAGMA locking_mode = NORMAL;");
        globalThis.cachedClient.execute("PRAGMA journal_mode = WAL;");
        globalThis.cachedClient.execute("PRAGMA synchronous = NORMAL;");
        globalThis.cachedClient.execute("PRAGMA cache_size = 10000;");
        globalThis.cachedClient.execute("PRAGMA temp_store = MEMORY;");
        globalThis.cachedClient.execute("PRAGMA mmap_size = 268435456;"); // 256MB
        globalThis.cachedClient.execute("PRAGMA busy_timeout = 30000;"); // 30 second timeout
        globalThis.cachedClient.execute("PRAGMA wal_autocheckpoint = 1000;"); // checkpoint every 1000 pages

        globalThis.cachedDb = drizzle(globalThis.cachedClient);
    }

    return globalThis.cachedDb;
}

export function closeDb() {
    if (globalThis.cachedClient) {
        globalThis.cachedClient.close();
        globalThis.cachedClient = null;
        globalThis.cachedDb = null;
    }
}

export default db;

export async function executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 10
): Promise<T | undefined> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (
                (error instanceof LibsqlError &&
                    error.code.startsWith("SQLITE_BUSY")) ||
                (error instanceof DrizzleQueryError &&
                    error.cause instanceof LibsqlError &&
                    error.cause.code.startsWith("SQLITE_BUSY") &&
                    attempt < maxRetries - 1)
            ) {
                const delay = Math.pow(2, attempt) * 100 + Math.random() * 50;
                await wait(delay);
                continue;
            }

            throw error;
        }
    }
}
