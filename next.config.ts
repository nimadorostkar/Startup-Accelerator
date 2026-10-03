import path from "node:path";
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

/** Where the API is (the same default as lib/api.ts). */
const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:8000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // A self-contained server (.next/standalone) for the Docker image.
  output: "standalone",
  poweredByHeader: false,
  // Next's own cache, plus a memory cache for optimised images (see the file).
  cacheHandler: path.resolve("cache-handler.mjs"),
  experimental: {
    // Pages refreshed after the build (events, articles, startups, and the 404s
    // for made-up addresses) stay in the server's memory cache (an LRU,
    // cacheMaxMemorySize, 50 MB by default) rather than being written to disk,
    // where anyone requesting random addresses could fill the container's disk.
    // This also switches off Next's disk cache of optimised images, so they are
    // cached by cache-handler.mjs instead (images.customCacheHandler below).
    isrFlushToDisk: false,
    // A logo or founder photo (5 MB at most, checked by the API) with its form.
    serverActions: { bodySizeLimit: "6mb" },
  },
  // Startup logos and founder photos live at /api/v1/media/…. In production Caddy
  // serves them before a request gets here; in development (no Caddy) the website
  // passes them on to the API.
  async rewrites() {
    return [{ source: "/api/v1/media/:path*", destination: `${BACKEND_URL}/api/v1/media/:path*` }];
  },
  images: {
    customCacheHandler: true,
    // Serve AVIF where supported, WebP otherwise.
    formats: ["image/avif", "image/webp"],
    qualities: [55, 75],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
