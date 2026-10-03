import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in areas and the API-style export are never for search engines.
      disallow: [
        "/dashboard",
        "/admin",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/newsletter/unsubscribe",
        "/api/",
        "/backoffice/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
