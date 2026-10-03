# Languages (i18n)

The public site is in **English**, **Turkish** and **Persian**. The founder dashboard and the review panel are English only.

| | |
| --- | --- |
| Addresses | English at the bare paths (`/events`), Turkish at `/tr/events`, Persian at `/fa/events`. `src/proxy.ts` serves the bare paths from `app/[lang]` as `en` and redirects `/en/…` to them |
| Pages | `src/app/[lang]/…` (public, every language prerendered) and `src/app/(app)/…` (dashboard, review panel: English) |
| Config | [config.ts](config.ts): `LOCALES`, `LOCALE_INFO` (name, direction, Intl locale), `localePath`, `splitLocale` |
| Strings | [messages/](messages/)`<locale>/<area>.ts`. English is the source; the Turkish and Persian files are typed `typeof en`, so a missing or extra key fails `tsc` |

## Using strings

- **Server components:** `const { events } = await getDictionary()` from [server.ts](server.ts) (it reads the URL's language with `next/root-params`; outside `app/[lang]` it's English). `await getLocale()` for the language itself.
- **Client components** get their strings as props from the server component that renders them (a slice like `t={events.register}`), never the whole dictionary. `useLocale()` from [client.tsx](client.tsx) gives the language.
- **Strings only** in dictionaries (no functions: they cross to client components). Placeholders `{name}` filled with `format()` from [format.ts](format.ts); counts with `plural(locale, n, { one, other })` (its `{count}` placeholder); sentences with elements inside (a link, a bold word) with `rich(template, { link: <Link…/> })` from [rich.tsx](rich.tsx), so each language puts them where its word order wants (`\n` becomes a line break); numbers with `formatNumber`; dates with `Intl.DateTimeFormat(LOCALE_INFO[locale].intl, …)` (Persian gets the Persian calendar and digits).
- **Links:** `import { LocalLink as Link } from "@/i18n/client"` instead of `next/link`: `href="/events"` becomes `/tr/events` on a Turkish page. `/dashboard`, `/admin`, other sites and `#…` are left alone. `ButtonLink` already does this. For a plain `<a>`, use `localePath(locale, "/events")`.
- **Server Actions** can't read the URL's language: the form sends it in a hidden field, `<input type="hidden" name="lang" value={locale} />`, and the action reads it with `formLocale(form)` and passes what it shows through `translateMessage(locale, message)` / `translateErrors(locale, errors)` ([form-messages.ts](form-messages.ts)). The translations of validation and API messages are in `formMessages.ts`, keyed by the exact English text (a single number in a message is matched as `{n}`).
- **Metadata:** `generateMetadata` instead of a static `metadata` export, reading the dictionary.

## Right to left (Persian)

`<html dir="rtl">` on Persian pages. Use logical utilities so layouts mirror by themselves:

| Instead of | Use |
| --- | --- |
| `ml-* mr-* pl-* pr-*` | `ms-* me-* ps-* pe-*` |
| `left-* right-*` (positioning) | `start-* end-*` |
| `text-left text-right` | `text-start text-end` |
| `rounded-l-* border-r-*` … | `rounded-s-* border-e-*` … |
| `origin-left`, `bg-gradient-to-r`, a `translate-x` that means "forward" | add an `rtl:` counterpart (`rtl:origin-right`, `rtl:bg-gradient-to-l`, `rtl:-translate-x-…`) |

Forward-pointing icons (`ArrowRight`, `ChevronRight` in `components/icons.tsx`) carry `data-flip` and mirror themselves, hover nudge included. Things that are not about reading direction stay as they are: logos, photos, maps, progress fills that grow from the start, numbers. Persian uses Vazirmatn (DM Sans has no Arabic-script letters) and no letter-spacing (it would pull joined letters apart); `uppercase` has no effect on it.

## Writing the translations

- Same meaning and tone as the English: confident, warm, concise. Turkish addresses the reader as **sen** ("Girişimini başlat"); Persian as **شما**, polite but not stiff.
- Keep names as they are: Fundup Club, The Founder Brief, company and people names. "Demo Day" stays "Demo Day" in Turkish and is **دمو دی** in Persian.
- Persian: Persian digits in prose (۶۵+), Persian punctuation (، ؛ ؟ «»), the zero-width non-joiner where words need it (می‌کنیم، استارتاپ‌ها).
- Keep English strings exactly as they were: the end-to-end tests read them.
- Content from the API (events, articles, startups' answers) is shown as written; only the site's own words are translated.
