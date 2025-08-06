import db from "@/db";
import { Screenshot, screenshotsTable } from "@/db/schema";
import { LibsqlError } from "@libsql/client";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import { Client, TakeOptions } from "screenshotone-api-sdk";
import { wait } from "./utils";

const client = new Client(
    process.env.SCREENSHOTONE_API_ACCESS_KEY!,
    process.env.SCREENSHOTONE_API_SECRET_KEY!
);

// one month
const cacheTtl = 2592000;

export async function requestScreenshot(url: string): Promise<string> {
    const screenshotId = crypto.randomUUID();

    let attempts = 0;
    while (true) {
        try {
            await db().insert(screenshotsTable).values({
                id: screenshotId,
                url,
            });
            break;
        } catch (error) {
            if (
                error instanceof LibsqlError &&
                error.code.startsWith("SQLITE_BUSY") &&
                attempts < 5
            ) {
                attempts++;
                await wait(100 * attempts);
                continue;
            }

            throw error;
        }
    }

    return screenshotId;
}

export async function processPendingScreenshots() {
    const screenshots = await fetchPendingScreenshots();

    for (const screenshot of screenshots) {
        try {
            await processScreenshot(screenshot);
        } catch (error) {
            if (
                error instanceof LibsqlError &&
                error.code.startsWith("SQLITE_BUSY")
            ) {
                // retry
                continue;
            }

            throw error;
        }
    }

    await removeOutdatedScreenshots();
}

async function removeOutdatedScreenshots() {
    try {
        await db()
            .delete(screenshotsTable)
            .where(lt(screenshotsTable.createdAt, Date.now() - cacheTtl));
    } catch (error) {
        if (
            error instanceof LibsqlError &&
            error.code.startsWith("SQLITE_BUSY")
        ) {
            // retry
            return;
        }
    }
}

async function fetchPendingScreenshots(): Promise<Screenshot[]> {
    const screenshots = await db()
        .select()
        .from(screenshotsTable)
        .where(eq(screenshotsTable.status, "pending"))
        .orderBy(desc(screenshotsTable.createdAt));

    return screenshots;
}

async function processScreenshot(screenshot: Screenshot) {
    const claimed = await claimScreenshot(screenshot.id);
    if (!claimed) {
        // claimed by another worker
        return;
    }

    console.log(`Processing screenshot ${screenshot.id}`);

    try {
        const cacheKey = screenshot.id.replace(/[^a-zA-Z0-9]/g, "");
        const { screenshotUrl, errorCode, errorMessage } =
            await renderScreenshot(new URL(screenshot.url), "jpeg", cacheKey);

        await updateScreenshotResult(screenshot.id, {
            status: errorCode ? "failed" : "completed",
            screenshotUrl,
            errorCode,
            errorMessage,
        });

        console.log(`Screenshot ${screenshot.id} completed successfully`);
    } catch (error) {
        console.error(`Error processing screenshot ${screenshot.id}:`, error);

        await updateScreenshotResult(screenshot.id, {
            status: "failed",
        });

        throw error;
    }
}

async function claimScreenshot(screenshotId: string): Promise<boolean> {
    try {
        const result = await db()
            .update(screenshotsTable)
            .set({
                status: "in_progress",
                updatedAt: sql`(CURRENT_TIMESTAMP)`,
            })
            .where(
                and(
                    eq(screenshotsTable.id, screenshotId),
                    eq(screenshotsTable.status, "pending")
                )
            )
            .returning();

        return result.length > 0;
    } catch (error) {
        if (
            error instanceof LibsqlError &&
            error.code.startsWith("SQLITE_BUSY")
        ) {
            // retry
            return false;
        }

        throw error;
    }
}

async function updateScreenshotResult(
    screenshotId: string,
    updates: {
        status: "completed" | "failed";
        screenshotUrl?: string;
        errorCode?: string;
        errorMessage?: string;
    }
) {
    try {
        await db()
            .update(screenshotsTable)
            .set({
                ...updates,
                updatedAt: sql`(CURRENT_TIMESTAMP)`,
            })
            .where(eq(screenshotsTable.id, screenshotId));
    } catch (error) {
        if (
            error instanceof LibsqlError &&
            error.code.startsWith("SQLITE_BUSY")
        ) {
            // retry
            return;
        }

        throw error;
    }
}

export async function renderScreenshot(
    websiteUrl: URL,
    format: "jpeg" | "png",
    cacheKey: string
): Promise<{
    screenshotUrl?: string;
    errorCode?: string;
    errorMessage?: string;
}> {
    const screenshotUrl = await client.generateTakeURL(
        TakeOptions.url(websiteUrl.toString())
            .cache(true)
            .cacheKey(cacheKey)
            .cacheTtl(cacheTtl)
            .blockCookieBanners(true)
            .blockBannersByHeuristics(true)
            .blockAds(true)
            .blockChats(true)
            .responseType("json")
            .format(format)
    );

    const response = await fetch(screenshotUrl);
    if (!response.ok) {
        const data = (await response.json()) as {
            error_message: string;
            error_code: string;
        };

        return {
            errorCode: data.error_code,
            errorMessage: data.error_message,
        };
    }

    const data = (await response.json()) as { screenshot_url: string };

    return { screenshotUrl: data.screenshot_url };
}
