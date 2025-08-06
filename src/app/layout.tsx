import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "TakeScreenshot.app",
    description: "Render Website Screenshots Online for Free",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <div className="font-sans items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
                    <header>
                        <h1 className="text-2xl font-bold">
                            TakeScreenshot.app
                        </h1>
                    </header>
                    <main>{children}</main>
                    <footer>
                        <p>
                            &copy; {new Date().getFullYear()}
                            <Link href="https://screenshotone.com">
                                ScreenshotOne
                            </Link>
                            .
                        </p>
                    </footer>
                </div>
            </body>
        </html>
    );
}
