import nextEnv from "@next/env";
if (nextEnv && "loadEnvConfig" in nextEnv) {
    nextEnv.loadEnvConfig(process.cwd());
} else {
    // eslint-disable-next-line
    require("@next/env").loadEnvConfig(process.cwd());
}

import { processPendingScreenshots } from "./screenshots";
import { wait } from "./utils";

async function main(signal?: AbortSignal) {
    while (!signal?.aborted) {
        try {
            await processPendingScreenshots();
        } catch (error) {
            console.error("Error processing screenshots:", error);
        }

        await wait(500);
    }
}

const abortController = new AbortController();

const signals = ["SIGINT", "SIGTERM", "SIGQUIT"];
for (const signal of signals) {
    process.on?.(signal, () => {
        console.log(`Received ${signal}, stopping...`);
        abortController.abort();
    });
}

main(abortController.signal).catch(console.error);
