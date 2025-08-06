import { requestScreenshot } from "@/lib/screenshots";
import { screenshotFormSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";
import { connection } from 'next/server'

export async function POST(request: NextRequest) {
    await connection();

    try {
        const requestData = screenshotFormSchema.safeParse(
            await request.json()
        );
        if (!requestData.success) {
            return NextResponse.json(
                { message: "Invalid request" },
                { status: 400 }
            );
        }

        const screenshotId = await requestScreenshot(requestData.data.url);

        return NextResponse.json({
            url: `${process.env.BASE_URL}/screenshots/${screenshotId}`,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Internal server error. Please, try again." },
            { status: 500 }
        );
    }
}
