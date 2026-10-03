import { redirect } from "next/navigation";
import { api, BackendUnavailable } from "@/lib/api";

/* Every application as a CSV, for the support team's own analysis. The API
   builds it (reviewers only — anyone else gets a 404, like the panel) with
   formula-looking cells neutralised; this just passes the file through. */

export async function GET() {
  let result;
  try {
    result = await api("/admin/export.csv", { auth: true, raw: true });
  } catch (err) {
    if (err instanceof BackendUnavailable) return new Response("The export is unavailable right now.", { status: 503 });
    throw err;
  }
  if (!result.ok) {
    // Signed out (or the session ended): sign in again, like the rest of the panel.
    if (result.status === 401) redirect("/login");
    if (result.status === 429) {
      return new Response(result.error.message ?? "Too many requests. Please try again shortly.", {
        status: 429,
        headers: { "Retry-After": result.response.headers.get("Retry-After") ?? "60" },
      });
    }
    return new Response("Not found", { status: 404 });
  }

  const upstream = result.response;
  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "text/csv; charset=utf-8",
      "Content-Disposition": upstream.headers.get("Content-Disposition") ?? 'attachment; filename="applications.csv"',
      "Cache-Control": "no-store",
    },
  });
}
