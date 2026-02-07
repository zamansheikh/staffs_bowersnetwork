import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'logos.bowlersnetwork.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'test.bowlersnetwork.com',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
