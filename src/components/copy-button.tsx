"use client";

import { CopyIcon } from "lucide-react";
import { Button } from "./ui/button";

export function CopyButton({ data }: { data: string }) {
    return (
        <Button
            variant="default"
            onClick={() => {
                navigator.clipboard.writeText(data);
            }}
        >
            <CopyIcon className="size-4" />
            Copy To Share
        </Button>
    );
}
