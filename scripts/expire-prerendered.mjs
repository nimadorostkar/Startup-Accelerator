/* Runs after `next build` (npm "postbuild").

   Pages that show live data — events, articles, the startup directory — are
   prerendered at build time WITHOUT it: the API isn't reachable while the
   image is built (lib/api.ts, BUILDING). Next dates a prerendered page by its
   file's modification time, so backdating the files makes the server treat
   them as expired: the first visit after a deploy renders the page with live
   data (blocking) instead of serving the empty build-time copy. From then on
   the normal ISR cache applies. Pages without live data just render once more. */

import { readdir, stat, utimes } from "node:fs/promises";
import path from "node:path";

const LONG_AGO = new Date("2000-01-01T00:00:00Z");
const ROOTS = [".next/server/app", ".next/standalone/.next/server/app"];

async function backdate(dir) {
  let count = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += await backdate(full);
    else if (/\.(html|rsc|meta|body)$/.test(entry.name)) {
      await utimes(full, LONG_AGO, LONG_AGO);
      count += 1;
    }
  }
  return count;
}

for (const root of ROOTS) {
  const exists = await stat(root).then((s) => s.isDirectory()).catch(() => false);
  if (exists) console.log(`expire-prerendered: backdated ${await backdate(root)} files in ${root}`);
}
