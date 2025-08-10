import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Aperture } from "lucide-react";
import GitHubButton from "@/components/github-button";

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
    icons: {
        icon: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-aperture-icon lucide-aperture"><circle cx="12" cy="12" r="10"/><path d="m14.31 8 5.74 9.94"/><path d="M9.69 8h11.48"/><path d="m7.38 12 5.74-9.94"/><path d="M9.69 16 3.95 6.06"/><path d="M14.31 16H2.83"/><path d="m16.62 12-5.74 9.94"/></svg>`,
    },
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
                <div className="font-sans min-h-screen flex flex-col p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 gap-8 sm:gap-12 md:gap-16 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)] bg-[length:20px_20px]">
                    <header className="flex flex-col gap-4 lg:gap-0 lg:flex-row lg:justify-between lg:items-center">
                        <div>
                            <div className="flex items-center gap-4">
                                <Aperture className="size-5" />
                                <p className="text-xl sm:text-2xl font-bold">
                                    <Link href="/">TakeScreenshot.app</Link>
                                </p>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500">
                                <Link href="/">
                                    Render Website Screenshots Online for Free
                                </Link>
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/posts"
                                className="text-sm sm:text-base"
                            >
                                Resources
                            </Link>
                            <GitHubButton />
                        </div>
                    </header>
                    <main className="flex-1 flex">{children}</main>
                    <footer>
                        <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row justify-between ">
                            <p className="text-xs sm:text-sm text-gray-500">
                                &copy; {new Date().getFullYear()} &nbsp;
                                <Link href="/">
                                    TakeScreenshot.app
                                    <br />
                                    Render Website Screenshots without
                                    Registration
                                </Link>
                            </p>
                            <ul className="text-xs sm:text-sm text-gray-500 flex flex-row items-center gap-4">
                                <li>
                                    <Link href="https://github.com/screenshotone/takescreenshotapp">
                                        GitHub
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </footer>
                </div>
            </body>
        </html>
    );
}
