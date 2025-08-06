import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const screenshotsTable = sqliteTable("screenshots", {
    id: text().primaryKey().unique(),
    url: text().notNull(),
    status: text({ enum: ["pending", "in_progress", "completed", "failed"] })
        .notNull()
        .default("pending"),
    createdAt: int("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    screenshotUrl: text("screenshot_url"),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    updatedAt: int("updated_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});

export type Screenshot = typeof screenshotsTable.$inferSelect;
