"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AutoRefresh({ interval = 1000 }: { interval?: number }) {
    const router = useRouter();

    useEffect(() => {
        const intervalId = setInterval(() => {
            router.refresh();
        }, interval);
        return () => clearInterval(intervalId);
    }, [router, interval]);

    return null;
}
