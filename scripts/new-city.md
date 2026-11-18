# Nightly city research checklist

The goal of a nightly run is to ship **one useful city page**, not a long list of unverified names. Adding a city means adding one file under `data/cities/` and rebuilding.

## 1. Pick the city

Choose a place people actually search when a U-Haul reservation is cancelled, the lot is empty, or they already have a truck and need labor-only help. Prefer metros with recurring complaints and official locator pages over cities that already have a strong, current directory.

Filename: `data/cities/<st>-<city>.json`  
Examples: `ny-new-york.json`, `ca-los-angeles.json`, `il-chicago.json`  
Use the two-letter state, lowercase, then a hyphen, then the city slug.

Copy `scripts/city.template.json` and fill it in.

## 2. Find candidates

Search for public pages, not hearsay:

- Official location pages for U-Haul, Penske, Budget Truck Rental, and Enterprise Truck Rental
- Home Depot or Lowe’s rental-center pages only when the official store or partner page confirms truck or cargo-van rental at that store
- Independent truck-rental dealers listed on those official locators
- Labor-only or “loading only” movers whose own websites publish an address and hours (or clearly omit hours)
- HireAHelper and U-Haul Moving Help are marketplaces: link them in the affiliate or guide box, and only add a marketplace as a city listing if it publishes a verifiable local street address

Skip a business if you cannot find its own page or an official locator page with an address. Do not cache live truck inventory; deep-link the reservation page instead.

## 3. Verify every fact on a public page

For each listing, record only what the source says:

- Name, area, street address, phone, website, reservation or booking URL
- `category`: `truck` or `labor`
- Hours by day. If the source only publishes Monday–Saturday, write Sunday as `Not published` — do not invent “Closed.”
- `offers` as an array of the services the page uses (for example `["Cargo vans", "26 ft trucks"]` or `["Labor-only loading"]`)
- Flags: `oneWay`, `laborOnly`, `weekendHours`, `cargoVan`
- Fee notes, only if published
- `sources[]` with a label and the exact URL
- `lastChecked` as today’s date (`YYYY-MM-DD`)

**One-way** is true only when that location’s public page mentions one-way rentals. A national brand that offers one-way somewhere else is not enough.

**Labor only** is true only when the source says the business will load or unload a truck, van, or container the customer already has.

**Weekend hours** is true only when Saturday or Sunday is published as an open interval, not `Closed`, `Not published`, or “by appointment” alone. Saturday open and Sunday by appointment can still set the flag, because Saturday is a published weekend window.

**Cargo van** is true only when the location page lists cargo vans.

If two sources disagree, prefer the official brand or business site and say so in `hours.notes`. If you cannot verify a detail, omit it. If you cannot verify the business at all, do not list it.

Do not call businesses just to fill a spreadsheet unless a later playbook says otherwise. This checklist is written so a pass can be done from public pages.

## 4. Aim for quality, not a quota

Ten to twenty solid listings is enough for a first city page, mixing truck-rental locations and at least some labor or moving-help options when those can be verified. Fewer is fine if that is all that can be verified. Zero invented rows is the hard rule.

Write a short, honest `intro` for the city. Mention any focus (a borough, a downtown, a nearby suburb you included) instead of implying citywide coverage you did not research.

## 5. Build and check

```bash
npm run check
```

That command validates the JSON, builds the site, and fails if a required field is missing or an internal link is broken. If it passes, commit the new city file (and the built site stays out of git).

## 6. After publish

Update `lastUpdated` on the city file when listings change. On later nights, recrawl the oldest `lastChecked` dates before adding a second city, so pages do not rot. Recheck hours and one-way claims especially; those are the details that drift. Never snapshot live truck counts into the JSON.
