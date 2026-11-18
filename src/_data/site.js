/**
 * Site-wide config. `url` is the only deploy switch. Canonical tags,
 * Open Graph, JSON-LD, robots.txt, sitemap.xml, and the Eleventy path
 * prefix all follow it. Do not add a trailing slash.
 *
 * GitHub Pages project site:
 *   https://truekao1.github.io/lastminutemovers
 *
 * Affiliate `url` values stay empty until a program issues a tracked
 * link. Templates must then fall back to `publicUrl` as a plain
 * (non-affiliate) link. Do not present an empty or public URL as a
 * tracked affiliate link.
 *
 * Truck rental companies are linked as plain reservation or location
 * pages. No publisher affiliate program with published conversion
 * terms was found for U-Haul, Penske, Budget, or Enterprise Truck Rental.
 */
const url = normalizeSiteUrl("https://truekao1.github.io/lastminutemovers");

function normalizeSiteUrl(value) {
  const parsed = new URL(value);
  parsed.hash = "";
  parsed.search = "";
  parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  if (!parsed.pathname || parsed.pathname === "/") return parsed.origin;
  return parsed.origin + parsed.pathname;
}

function pathPrefixFromUrl(value) {
  const { pathname } = new URL(value);
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export default {
  name: "LastMinuteMovers",
  tagline: "Find a moving truck when U-Haul is sold out, and labor-only help to load the one you already have.",
  description:
    "A directory of truck-rental alternatives and labor-only movers, built for the day a reservation falls through: Penske, Budget, Enterprise, and other public locations, plus crews who will load a truck or container you already have.",
  url,
  pathPrefix: pathPrefixFromUrl(url),
  locale: "en_US",
  language: "en",
  emailListings: "azb31pt9@mail.grokbot.com",
  emailContact: "azb31pt9@mail.grokbot.com",
  emailsArePlaceholders: false,
  disclosure:
    "LastMinuteMovers may earn a commission if you use an approved affiliate link, at no extra cost to you. Until a program approves a tracked URL, buttons go to that company’s public website and are not affiliate links. Truck rental companies are linked as plain reservation pages, not affiliate offers.",
  affiliates: {
    hireAHelper: {
      id: "hireAHelper",
      name: "HireAHelper",
      url: "",
      publicUrl: "https://www.hireahelper.com/",
      programUrl: "https://www.hireahelper.com/affiliate/",
    },
    neighbor: {
      id: "neighbor",
      name: "Neighbor",
      url: "",
      publicUrl: "https://www.neighbor.com/",
      programUrl: "https://host.neighbor.com/affiliate/",
    },
  },
};
