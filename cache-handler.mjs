/* The website's server cache: Next's own, plus a memory cache for optimised images.

   next.config.ts keeps pages rendered after the build in memory rather than on
   disk (experimental.isrFlushToDisk: false). That setting also turns off Next's
   cache of optimised images (/_next/image), which lives on disk: every request
   would re-encode its image (about a second of CPU each, stalling the whole
   server under load). So images are kept here instead, in memory, up to
   MAX_BYTES, least recently used out first. The set of possible images is small
   (our own files × the configured sizes, qualities and formats), so this can't
   be filled from outside either.

   Everything else (pages, route handlers, fetches, tags) is handed to Next's
   built-in cache unchanged. It is an internal module: if a Next upgrade moves
   it, the build fails here, and the end-to-end suite covers what it does. */

import fileSystemCache from "next/dist/server/lib/incremental-cache/file-system-cache.js";

const FileSystemCache = fileSystemCache.default ?? fileSystemCache;

const MAX_BYTES = 64 * 1024 * 1024;

/** key → { value, lastModified }, least recently used first. Shared by every instance. */
const images = new Map();
let bytes = 0;

export default class CacheHandler extends FileSystemCache {
  async get(key, ctx) {
    if (ctx?.kind !== "IMAGE") return super.get(key, ctx);
    const entry = images.get(key);
    if (!entry) return null;
    images.delete(key);
    images.set(key, entry); // now the most recently used
    return entry;
  }

  async set(key, data, ctx) {
    if (data?.kind !== "IMAGE") return super.set(key, data, ctx);
    const previous = images.get(key);
    if (previous) {
      bytes -= previous.value.buffer.length;
      images.delete(key);
    }
    if (data.buffer.length > MAX_BYTES) return;
    images.set(key, { value: data, lastModified: Date.now() });
    bytes += data.buffer.length;
    for (const [oldest, entry] of images) {
      if (bytes <= MAX_BYTES) break;
      bytes -= entry.value.buffer.length;
      images.delete(oldest);
    }
  }
}
