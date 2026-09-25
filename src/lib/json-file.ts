import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/* Development storage for small lists (contact messages, newsletter
   subscribers): one JSON file per list under `.data/` (gitignored).
   Not production storage — see docs/backend-integration.md. */

let queue: Promise<unknown> = Promise.resolve();

/** Read → change → write one file. Writes are queued so they never overlap. */
export function updateJsonFile<T, R>(
  name: string,
  empty: T,
  fn: (current: T) => { next: T; result: R },
): Promise<R> {
  const file = path.join(process.cwd(), ".data", name);
  const run = queue.then(async () => {
    let current = empty;
    try {
      current = JSON.parse(await readFile(file, "utf8"));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
    const { next, result } = fn(current);
    await mkdir(path.dirname(file), { recursive: true });
    // Write-then-rename, so a crash mid-write can't leave half a file behind.
    const tmp = `${file}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(next, null, 2));
    await rename(tmp, file);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}
