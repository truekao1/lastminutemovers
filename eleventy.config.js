import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HtmlBasePlugin } from "@11ty/eleventy";
import site from "./src/_data/site.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function originAndPrefix(base) {
  const root = String(base || "").replace(/\/$/, "");
  try {
    const { origin, pathname } = new URL(root);
    const prefix = !pathname || pathname === "/" ? "" : pathname.replace(/\/$/, "");
    return { origin, prefix, root };
  } catch {
    return { origin: root, prefix: "", root };
  }
}

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addWatchTarget("data/cities/");
  eleventyConfig.addWatchTarget("src/assets/");

  eleventyConfig.addFilter("isoDate", (value) => {
    if (!value) return "";
    return String(value).slice(0, 10);
  });

  eleventyConfig.addFilter("displayDate", (value) => {
    if (!value) return "";
    const d = new Date(`${String(value).slice(0, 10)}T12:00:00`);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("hoursSummary", (hours) => {
    if (!hours) return "Confirm with the store";
    if (hours.summary) return hours.summary;
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const values = days.map((day) => (hours[day] || "").trim());
    const groups = [];
    let i = 0;
    while (i < 7) {
      let j = i;
      while (j + 1 < 7 && values[j + 1] === values[i] && values[i]) j += 1;
      if (values[i]) {
        const label = i === j ? labels[i] : `${labels[i]}–${labels[j]}`;
        groups.push(`${label} ${values[i]}`);
      }
      i = j + 1;
    }
    return groups.join("; ") || "Confirm with the store";
  });

  eleventyConfig.addFilter("telHref", (phone) => {
    if (!phone) return "";
    const digits = String(phone).replace(/[^\d+]/g, "");
    return digits ? `tel:${digits}` : "";
  });

  eleventyConfig.addFilter("slugifyId", (name) =>
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );

  eleventyConfig.addFilter("jsonLd", (obj) =>
    JSON.stringify(obj).replace(/</g, "\\u003c")
  );

  eleventyConfig.addFilter("absoluteUrl", (pathname, base) => {
    const { origin, prefix, root } = originAndPrefix(base);
    if (!pathname) return `${root}/`;
    if (/^https?:\/\//.test(pathname)) return pathname;
    const pathName = pathname.startsWith("/") ? pathname : `/${pathname}`;
    if (prefix && (pathName === prefix || pathName.startsWith(`${prefix}/`))) {
      return `${origin}${pathName}`;
    }
    return `${root}${pathName}`;
  });

  eleventyConfig.addFilter("cityPath", (city) => {
    const state = String(city.state || "").toLowerCase();
    const slug =
      city.citySlug ||
      String(city.city || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
    return `/${state}/${slug}/`;
  });

  eleventyConfig.addFilter("joinList", (items) => {
    if (!Array.isArray(items) || !items.length) return "";
    return items.join(", ");
  });

  eleventyConfig.addFilter("affiliateHref", (program) => {
    if (!program) return "";
    const tracked = String(program.url || "").trim();
    if (tracked) return tracked;
    return program.publicUrl || "";
  });

  eleventyConfig.addFilter("affiliateIsTracked", (program) =>
    Boolean(program && String(program.url || "").trim())
  );

  const dayMap = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  function parseClockRange(value) {
    if (!value) return null;
    const text = String(value);
    if (/^not published$/i.test(text.trim())) return null;
    if (/^closed$/i.test(text.trim())) return null;
    const re =
      /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)|midnight|noon)\s*[–-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)|midnight)/i;
    const m = text.match(re);
    if (!m) return null;
    const to24 = (s) => {
      const t = s.trim().toLowerCase();
      if (t === "midnight") return "00:00";
      if (t === "noon") return "12:00";
      const mm = t.match(/(\d{1,2}):(\d{2})\s*(am|pm)/);
      if (!mm) return null;
      let h = Number(mm[1]);
      const min = mm[2];
      const ap = mm[3];
      if (ap === "pm" && h !== 12) h += 12;
      if (ap === "am" && h === 12) h = 0;
      return `${String(h).padStart(2, "0")}:${min}`;
    };
    let opens = to24(m[1]);
    let closes = to24(m[2]);
    if (!opens || !closes) return null;
    if (closes === "00:00" && /midnight/i.test(m[2])) closes = "23:59";
    return { opens, closes };
  }

  function listingToLocalBusiness(listing) {
    const url = listing.website || listing.bookingUrl;
    const business = {
      "@type": "LocalBusiness",
      name: listing.name,
      url,
      telephone: listing.phone || undefined,
      areaServed: listing.area,
      description:
        listing.offersNotes ||
        listing.feeNotes ||
        listing.visitNotes ||
        undefined,
    };
    if (listing.address) {
      business.address = {
        "@type": "PostalAddress",
        streetAddress: listing.address,
      };
    }
    const hours = [];
    if (listing.hours) {
      for (const [day, value] of Object.entries(dayMap)) {
        const raw = listing.hours[day];
        if (!raw) continue;
        if (/24\s*hours|24\/7/i.test(raw) && !/not\s+published|closed/i.test(raw)) {
          hours.push({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: value,
            opens: "00:00",
            closes: "23:59",
          });
          continue;
        }
        const range = parseClockRange(raw);
        if (range) {
          hours.push({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: value,
            opens: range.opens,
            closes: range.closes,
          });
        }
      }
    }
    if (hours.length) business.openingHoursSpecification = hours;
    return business;
  }

  eleventyConfig.addFilter("defaultCityFaqs", (city) => [
    {
      q: `What should I do if U-Haul is sold out in ${city.city}?`,
      a: `Start with the other truck-rental counters on this page — Penske, Budget, Enterprise, and any independent dealer those companies list. Then check a second borough or neighborhood, because inventory is local. We do not cache live truck availability. Follow each company’s reservation page and confirm the pickup time with the location.`,
    },
    {
      q: "Do these locations offer one-way rentals?",
      a: "We only flag one-way when that location’s public page mentions one-way rentals. Some companies offer one-way from some branches and not others, and the flag can be stale by the time you arrive. Confirm on the reservation page.",
    },
    {
      q: "What is labor-only moving help?",
      a: "Labor-only crews load or unload a truck, van, or portable container that you already have. They typically do not provide the vehicle. Use the labor-only filter on this page, or compare movers on HireAHelper, whose public site lets you book loading and unloading help.",
    },
    {
      q: "Are weekend hours guaranteed?",
      a: "No. We flag weekend hours only when a public page lists Saturday or Sunday opening times. Hours change around month-end and holidays. Call or check the location page before you drive over.",
    },
    {
      q: "Will a cargo van be enough?",
      a: "A cargo van is enough for a small load and is sometimes easier to park than a box truck. We only flag cargo vans when the location page lists them. Size and availability still have to be confirmed on the reservation page.",
    },
    {
      q: `How does LastMinuteMovers verify listings in ${city.city}?`,
      a: "We only publish facts we found on a public page — usually the business’s own website or an official location page. Each listing has source links and a last-checked date. We do not invent hours, truck types, or services, and we do not treat reservations as live inventory. If a site was down or a detail was unclear, we left it out.",
    },
  ]);

  eleventyConfig.addFilter("cityJsonLd", (city, siteObj) => {
    const pageUrl = `${siteObj.url}/${String(city.state).toLowerCase()}/${city.citySlug}/`;
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `Last-minute moving trucks and labor-only help in ${city.city}, ${city.state}`,
      url: pageUrl,
      isPartOf: { "@type": "WebSite", name: siteObj.name, url: siteObj.url },
      about: {
        "@type": "ItemList",
        name: `Truck rental locations and labor-only movers in ${city.city}, ${city.state}`,
        numberOfItems: (city.listings || []).length,
        itemListElement: (city.listings || []).map((listing, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: listingToLocalBusiness(listing),
        })),
      },
    };
  });

  eleventyConfig.addFilter("faqJsonLd", (faqs, pageUrl) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: pageUrl,
    mainEntity: (faqs || []).map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  }));

  eleventyConfig.addFilter("breadcrumbJsonLd", (crumbs, siteObj) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: (crumbs || []).map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.url
        ? crumb.url.startsWith("http")
          ? crumb.url
          : `${siteObj.url}${crumb.url.startsWith("/") ? crumb.url : `/${crumb.url}`}`
        : undefined,
    })),
  }));

  eleventyConfig.addFilter("homeJsonLd", (siteObj, cities) => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteObj.name,
    url: siteObj.url,
    description: siteObj.description,
    publisher: { "@type": "Organization", name: siteObj.name, url: siteObj.url },
    hasPart: {
      "@type": "ItemList",
      name: "Cities with last-minute moving help listings",
      numberOfItems: (cities || []).length,
      itemListElement: (cities || []).map((city, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${city.city}, ${city.state}`,
        url: `${siteObj.url}/${String(city.state).toLowerCase()}/${city.citySlug}/`,
      })),
    },
  }));

  eleventyConfig.addFilter("guideJsonLd", (siteObj) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "U-Haul sold out? Every other way to move this weekend",
    name: "U-Haul sold out? Every other way to move this weekend",
    url: `${siteObj.url}/guides/uhaul-sold-out-every-other-way-to-move-this-weekend/`,
    description:
      "Truck rental alternatives, labor-only loading help, portable containers, and moving-day tips for when a U-Haul reservation falls through.",
    isPartOf: { "@type": "WebSite", name: siteObj.name, url: siteObj.url },
    publisher: { "@type": "Organization", name: siteObj.name, url: siteObj.url },
  }));

  eleventyConfig.addCollection("cities", () => {
    const dir = path.join(__dirname, "data", "cities");
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((name) => name.endsWith(".json"))
      .map((name) => {
        const raw = fs.readFileSync(path.join(dir, name), "utf8");
        const data = JSON.parse(raw);
        data._file = name;
        if (!data.citySlug) {
          data.citySlug = String(data.city || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");
        }
        return data;
      })
      .sort((a, b) =>
        `${a.city}, ${a.state}`.localeCompare(`${b.city}, ${b.state}`)
      );
  });

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    pathPrefix: site.pathPrefix,
  };
}
