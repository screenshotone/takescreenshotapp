import db from "@/db";
import { sql } from "drizzle-orm";
import { connection, NextResponse } from "next/server";

export async function GET() {
    await connection();

    try {
        await db().select({ one: sql`1` });

        return NextResponse.json({
            healthy: true,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json({
            healthy: false,
        });
    }
}
