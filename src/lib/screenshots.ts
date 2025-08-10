import { cacheTtl } from "@/config";
import { db, executeWithRetry } from "@/db";
import { Screenshot, screenshotsTable } from "@/db/schema";
import { LibsqlError } from "@libsql/client";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { Client, TakeOptions } from "screenshotone-api-sdk";

const client = new Client(
    process.env.SCREENSHOTONE_API_ACCESS_KEY!,
    process.env.SCREENSHOTONE_API_SECRET_KEY!
);

export async function requestScreenshot(
    url: string,
    device?: "desktop" | "mobile",
    fullPage?: boolean
): Promise<string> {
    const screenshotId = crypto.randomUUID();

    await executeWithRetry(async () => {
        await db()
            .insert(screenshotsTable)
            .values({
                id: screenshotId,
                url,
                device: device ?? "desktop",
                fullPage: fullPage ? 1 : 0,
            });
    });

    return screenshotId;
}

export async function processPendingScreenshots() {
    const screenshots = await fetchPendingScreenshots();

    for (const screenshot of screenshots) {
        try {
            await processScreenshot(screenshot);
        } catch (error) {
            if (
                (error instanceof LibsqlError &&
                    error.code.startsWith("SQLITE_BUSY")) ||
                (error instanceof DrizzleQueryError &&
                    error.cause instanceof LibsqlError &&
                    error.cause.code.startsWith("SQLITE_BUSY"))
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
            (error instanceof LibsqlError &&
                error.code.startsWith("SQLITE_BUSY")) ||
            (error instanceof DrizzleQueryError &&
                error.cause instanceof LibsqlError &&
                error.cause.code.startsWith("SQLITE_BUSY"))
        ) {
            // retry
            return;
        }

        throw error;
    }
}

async function fetchPendingScreenshots(): Promise<Screenshot[]> {
    try {
        const screenshots = await db()
            .select()
            .from(screenshotsTable)
            .where(eq(screenshotsTable.status, "pending"))
            .orderBy(desc(screenshotsTable.createdAt));

        return screenshots;
    } catch (error) {
        if (
            (error instanceof LibsqlError &&
                error.code.startsWith("SQLITE_BUSY")) ||
            (error instanceof DrizzleQueryError &&
                error.cause instanceof LibsqlError &&
                error.cause.code.startsWith("SQLITE_BUSY"))
        ) {
            // retry
            return [];
        }

        throw error;
    }
}

async function processScreenshot(screenshot: Screenshot) {
    const claimed = await claimScreenshot(screenshot.id);
    if (!claimed) {
        // claimed by another worker
        return;
    }

    console.log(
        `Processing screenshot ${screenshot.id} (${
            screenshot.device === "desktop" ? "desktop" : "mobile"
        }, ${screenshot.fullPage ? "full page" : "above the fold"})`
    );

    try {
        const cacheKey = screenshot.id.replace(/[^a-zA-Z0-9]/g, "");
        const { screenshotUrl, errorCode, errorMessage } =
            await renderScreenshot(
                new URL(screenshot.url),
                "jpeg",
                cacheKey,
                screenshot.device as "desktop" | "mobile",
                screenshot.fullPage === 1
            );

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
            (error instanceof LibsqlError &&
                error.code.startsWith("SQLITE_BUSY")) ||
            (error instanceof DrizzleQueryError &&
                error.cause instanceof LibsqlError &&
                error.cause.code.startsWith("SQLITE_BUSY"))
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
    cacheKey: string,
    device?: "desktop" | "mobile",
    fullPage?: boolean
): Promise<{
    screenshotUrl?: string;
    errorCode?: string;
    errorMessage?: string;
}> {
    const options = TakeOptions.url(websiteUrl.toString())
        .cache(true)
        .cacheKey(cacheKey)
        .cacheTtl(cacheTtl)
        .blockCookieBanners(true)
        .blockBannersByHeuristics(true)
        .blockAds(true)
        .blockChats(true)
        .responseType("json")
        .format(format)
        .fullPage(fullPage ?? false);

    if (device === "mobile") {
        options.viewportDevice("iphone_x");
    }

    const response = await fetch(await client.generateTakeURL(options));
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
