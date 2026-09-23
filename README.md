# VC Summit — Landing Page

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Production config

| Variable               | Purpose                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Absolute site origin, e.g. `https://vcsummit.com`. Used for OG/Twitter image URLs. Defaults to `http://localhost:3000`. |

Security headers, AVIF/WebP image negotiation and `poweredByHeader: false` are set in `next.config.ts`.

## Structure

- `src/components/Hero.tsx` — hero section
- `src/components/Navbar.tsx`, `MobileMenu.tsx`, `nav-links.ts` — header + mobile nav
- `src/components/Logo.tsx` — VC monogram (SVG); `src/app/icon.svg` is the favicon
- `public/images/hero.webp` — **clean background plate**: every piece of text, button and line
  in the hero is rendered in code. Don't replace it with an image that has UI baked in.

## Layout notes

Desktop (`lg+`) sizing is expressed in container-query units (`cqw`) against a
1920px-max container, so the composition scales proportionally with the viewport and
freezes above 1920px. Below `lg` the hero uses a dedicated mobile scale.

If you swap `hero.webp`, clear Next's optimizer cache or you'll keep seeing the old image:

```bash
rm -rf .next/dev/cache/images .next/cache/images
```
