import db from "@/db";
import { screenshotsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Image from "next/image";

export default async function ScreenshotPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    await connection();

    const { id } = await params;

    const screenshots = await db()
        .select()
        .from(screenshotsTable)
        .where(eq(screenshotsTable.id, id))
        .limit(1);
    if (screenshots.length === 0) {
        return notFound();
    }

    const [screenshot] = screenshots;

    return (
        <div>
            <h1>Screenshot</h1>
            <p>{id}</p>
            <p>The URL and the screenshot URL expire after.</p>
            <p>{screenshot.url}</p>
            <p>{screenshot.status}</p>
            <p>{screenshot.screenshotUrl}</p>
            {screenshot.screenshotUrl && (
                <Image
                    src={screenshot.screenshotUrl}
                    alt={`Screenshot of ${screenshot.url}`}
                />
            )}
            <p>{screenshot.errorCode}</p>
            <p>{screenshot.errorMessage}</p>
            <p>{new Date(screenshot.createdAt).toLocaleString()}</p>
            <p>{new Date(screenshot.updatedAt).toLocaleString()}</p>
        </div>
    );
}
