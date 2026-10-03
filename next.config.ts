import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // A self-contained server (.next/standalone) for the Docker image.
  output: "standalone",
  poweredByHeader: false,
  experimental: {
    // Pages refreshed after the build (events, articles, startups, and the 404s
    // for made-up addresses) stay in the server's memory cache (an LRU,
    // cacheMaxMemorySize, 50 MB by default) rather than being written to disk,
    // where anyone requesting random addresses could fill the container's disk.
    isrFlushToDisk: false,
  },
  images: {
    // Serve AVIF where supported, WebP otherwise.
    formats: ["image/avif", "image/webp"],
    qualities: [55, 75],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
