import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        // Allow remote images from any hostname (use carefully in production)
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
