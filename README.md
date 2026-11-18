# LastMinuteMovers

A small, fast, static directory of **truck-rental alternatives** and **labor-only movers**, for the day a U-Haul reservation is cancelled or the lot is empty.

Brand name: **LastMinuteMovers**. The public URL in `src/_data/site.js` is `https://truekao1.github.io/lastminutemovers`. The Eleventy path prefix is derived from that URL. Do not put a personal name on the site.

This is an independent directory, not a truck rental company, moving company, or booking marketplace.

## Where it lives

Project path: `/workspace/sites/lastminutemovers`

Built files go to `dist/` and are published to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`.

## How to build

```bash
npm install
npm run build        # writes dist/
npm start            # local preview
npm run check        # validates city JSON, builds, checks internal links and JSON-LD
```

The public base URL, contact mailbox, and affiliate links are all in one file: `src/_data/site.js`. Affiliate `url` values stay empty until a program issues a tracked link. Templates then fall back to each company’s public website and must not present that fallback as an affiliate URL. Truck rental reservation links are always plain public links.

## Data schema

Add a city by adding one file: `data/cities/<st>-<city>.json` (for example `data/cities/ny-new-york.json`). The nightly research checklist is in `scripts/new-city.md`. A starter file is in `scripts/city.template.json`.

Rules:

- Never invent a business, hour, truck type, fee, phone, or flag.
- Every fact needs a public source URL and a `lastChecked` date.
- `oneWay` is true only when that location’s public page mentions one-way rentals.
- `laborOnly` is true only when the source will load or unload a truck, van, or container the customer already has.
- `weekendHours` is true only when Saturday or Sunday is published as an open interval.
- `cargoVan` is true only when the location page lists cargo vans.
- Do not cache live truck inventory. Deep-link the company’s reservation page.
- If a site is down or a detail is unclear, leave the listing or the detail out. Use `Not published` for a day’s hours rather than inventing “Closed.”

## Launch content

- Home page
- Guide: “U-Haul sold out? Every other way to move this weekend” (truck alternatives, labor-only help, portable containers, and moving-day tips)
- New York, NY — 15 verified listings (13 truck rental locations and 2 labor-only movers), last checked November 18, 2026, with a Manhattan, Brooklyn, Queens, and Bronx focus
- Los Angeles, CA — 15 verified listings (10 truck rental locations and 5 labor or moving-help options), last checked November 18, 2026, including one clearly labeled Beverly Hills office

## Affiliate programs

Application drafts (not sent) live in `AFFILIATES.md`. Program pages:

- HireAHelper (primary): https://www.hireahelper.com/affiliate/
- Neighbor (secondary, storage during a move): https://host.neighbor.com/affiliate/
- SpareFoot (optional, confirm in-network): https://about.sparefoot.com/partners

U-Haul, Penske, Budget, and Enterprise Truck Rental are plain reservation deep links, not affiliate offers.

## Stack

Eleventy 3 builds plain HTML, CSS, and a small vanilla JS filter into `dist/`. Pages are mobile-first, with unique titles and meta descriptions, canonical URLs, Open Graph tags, `sitemap.xml`, `robots.txt`, breadcrumbs, an affiliate disclosure, and JSON-LD (`WebSite` / `ItemList` on the home page; `CollectionPage` + `ItemList` + `LocalBusiness`, `FAQPage`, and `BreadcrumbList` on city pages; `Article` and `FAQPage` on the guide).
