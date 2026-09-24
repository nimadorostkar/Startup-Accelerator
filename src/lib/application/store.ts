import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Application } from "./types";

/* ══════════════════════════════════════════════════════════════════════
   STORAGE SWAP POINT — replace these two functions with your database.

   This version keeps every application in one JSON file under `.data/`
   (gitignored). It's enough to develop and demo against on a single
   server, but it is NOT production storage: it doesn't survive serverless
   deploys (read-only or ephemeral disks) or multiple server instances.

   Contract:
     findApplication(userId)        → the stored record, or null
     updateApplication(userId, fn)  → load (or start from `seed`), apply fn,
                                      persist, return the result — atomically
                                      per user, so two quick saves can't
                                      overwrite each other.
   In SQL that's a SELECT … FOR UPDATE inside a transaction.
   ══════════════════════════════════════════════════════════════════════ */

const FILE = path.join(process.cwd(), ".data", "applications.json");

async function readAll(): Promise<Record<string, Application>> {
  try {
    return JSON.parse(await readFile(FILE, "utf8"));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw err;
  }
}

async function writeAll(all: Record<string, Application>) {
  await mkdir(path.dirname(FILE), { recursive: true });
  // Write-then-rename, so a crash mid-write can't leave half a file behind.
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(all, null, 2));
  await rename(tmp, FILE);
}

/* Every write goes through one queue: read → modify → write never overlaps. */
let queue: Promise<unknown> = Promise.resolve();

export async function findApplication(userId: string) {
  await queue;
  return (await readAll())[userId] ?? null;
}

export function updateApplication(
  userId: string,
  seed: () => Application,
  fn: (current: Application) => Application,
): Promise<Application> {
  const run = queue.then(async () => {
    const all = await readAll();
    const next = fn(all[userId] ?? seed());
    all[userId] = next;
    await writeAll(all);
    return next;
  });
  queue = run.catch(() => {});
  return run;
}
