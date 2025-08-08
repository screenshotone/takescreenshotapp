import AutoRefresh from "@/components/auto-refresh";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cacheTtl } from "@/config";
import db from "@/db";
import { Screenshot, screenshotsTable } from "@/db/schema";
import { cn, generateUserFriendlyErrorMessage } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { AlertCircleIcon, DownloadIcon, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

function format(screenshot: Screenshot) {
    const expiresAt = new Date(
        new Date(screenshot.createdAt).getTime() + cacheTtl * 1000
    );
    const daysLeft = Math.ceil(
        (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const url = new URL(screenshot.url);
    let readableUrl = url.hostname + url.pathname.replace(/\/$/, "");
    if (readableUrl.length > 30) {
        readableUrl = readableUrl.slice(0, 30) + "...";
    }

    const now = new Date(Date.now());
    const createdAt = new Date(screenshot.createdAt + "Z");
    const secondsElapsed = Math.floor(
        (now.getTime() - createdAt.getTime()) / 1000
    );

    let progress = 0;
    if (secondsElapsed <= 3) {
        progress = 10;
    } else if (secondsElapsed > 3 && secondsElapsed <= 7) {
        progress = 50;
    } else if (secondsElapsed > 7 && secondsElapsed <= 21) {
        progress = 80;
    } else {
        progress = 90;
    }

    return {
        hostname: url.hostname,
        progress,
        daysLeft,
        readableUrl,
        isError: screenshot.status === "failed" || screenshot.errorCode,
        friendlyErrorMessage:
            screenshot.errorCode &&
            generateUserFriendlyErrorMessage(screenshot.errorCode),
    };
}

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
    const {
        hostname,
        readableUrl,
        daysLeft,
        progress,
        isError,
        friendlyErrorMessage,
    } = format(screenshot);

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-4 bg-white rounded-lg shadow p-8">
            {(screenshot.status === "in_progress" ||
                screenshot.status === "pending") && <AutoRefresh />}
            <div className="flex flex-row gap-2 items-center justify-between">
                <h1
                    className={cn(
                        "text-xl font-bold",
                        isError && "text-destructive"
                    )}
                >
                    Screenshot of {readableUrl}
                </h1>

                {screenshot.screenshotUrl && (
                    <Button asChild variant="default">
                        <a
                            href={screenshot.screenshotUrl}
                            download={`screenshot-${hostname}.png`}
                            target="_blank"
                            rel="noopener noreferrer"
                            tabIndex={-1}
                        >
                            <DownloadIcon className="size-4" />
                            Download
                        </a>
                    </Button>
                )}
            </div>
            <div className="flex flex-row gap-2 items-center justify-between">
                <p className="text-sm text-gray-500">
                    This is a temporary screenshot of{" "}
                    <Link
                        href={screenshot.url}
                        rel="nofollow"
                        target="_blank"
                        className="underline hover:no-underline underline-offset-4"
                    >
                        {readableUrl}{" "}
                        <ExternalLink className="size-3 inline mb-1" />
                    </Link>
                    .
                </p>
                <p className="text-sm text-gray-500">
                    {" "}
                    Requested at{" "}
                    {new Date(screenshot.createdAt).toLocaleString()}.{" "}
                    <b>
                        Expires in {daysLeft} {daysLeft === 1 ? "day" : "days"}
                    </b>
                    .
                </p>
            </div>

            {(screenshot.status === "in_progress" ||
                screenshot.status === "pending") && (
                <div className="flex flex-col gap-2 my-8">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-gray-500">Rendering...</p>
                </div>
            )}

            {screenshot.screenshotUrl && (
                <div className="flex items-center justify-center mt-8 max-h-[540px] overflow-scroll">
                    <Image
                        src={screenshot.screenshotUrl}
                        width={960}
                        height={540}
                        quality={100}
                        alt={`Screenshot of ${screenshot.url}`}
                    />
                </div>
            )}

            {isError && (
                <div className="flex items-center justify-center mt-8">
                    <Alert variant="destructive" className="max-w-lg">
                        <AlertCircleIcon />
                        <AlertTitle>Unable to render screenshot.</AlertTitle>
                        {friendlyErrorMessage && (
                            <AlertDescription>
                                <p>{friendlyErrorMessage}</p>
                            </AlertDescription>
                        )}
                    </Alert>
                </div>
            )}
        </div>
    );
}
