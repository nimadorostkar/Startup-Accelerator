/* The production container's start command (Dockerfile CMD).

   Waits for the API to be ready before starting the website. The public pages'
   build-time copies have no data (scripts/expire-prerendered.mjs), so the first
   visit renders them with live data; if the API were still starting (after a
   host reboot, restart policies ignore depends_on) that render would fail and
   the empty copy would be served for a while. After WAIT_SECONDS the site starts
   anyway, so a broken API never keeps the website down. */

const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const WAIT_SECONDS = Number(process.env.API_WAIT_SECONDS ?? 90);

async function ready() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/health/ready`, { signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch {
    return false;
  }
}

const deadline = Date.now() + WAIT_SECONDS * 1000;
let waited = false;
while (!(await ready())) {
  if (Date.now() > deadline) {
    console.warn(`The API at ${BACKEND_URL} isn't ready after ${WAIT_SECONDS}s; starting the website anyway.`);
    break;
  }
  if (!waited) console.log(`Waiting for the API at ${BACKEND_URL}…`);
  waited = true;
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

await import("./server.js");
