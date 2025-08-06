import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";

const nextConfig: NextConfig = {
    output: "standalone",
    compress: false,
    poweredByHeader: false,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.screenshotone.com",
            },
        ],
    },
};

export default withContentCollections(nextConfig);
