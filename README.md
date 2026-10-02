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

- `src/components/Hero.tsx` — hero section; its styles, founders panel, count-up and panel
  data are in `src/components/hero/`
- `src/components/Navbar.tsx`, `MobileMenu.tsx`, `nav-links.ts` — header + mobile nav
  (`variant="summit"` is the landing page's bar; Archivo is loaded in `src/app/page.tsx`)
- `src/components/Logo.tsx` — Fundup Club logo as SVG: `BrandLogo` (wordmark + fox tag) for
  headers and footers, `BrandMark` (fox tag alone) for small spaces; `src/app/icon.svg` is the
  favicon (the fox tag). Brand orange is `--brand` in `globals.css`
- `public/images/hero.webp` — **clean background plate**: every piece of text, button and line
  in the hero is rendered in code. Don't replace it with an image that has UI baked in.

## Layout notes

Desktop (`lg+`) sizing is expressed in container-query units (`cqw`) against a
1920px-max container, so the composition scales proportionally with the viewport and
freezes above 1920px.

The landing hero follows the same idea in `hero/Hero.module.css`: from 1101px it is laid
out on the handoff's 1440×900 frame, every length `N × --u` (one design pixel at the
current width, frozen at 1920px), with px floors on small text. Below 1101px it stacks.

If you swap `hero.webp`, clear Next's optimizer cache or you'll keep seeing the old image:

```bash
rm -rf .next/dev/cache/images .next/cache/images
```
