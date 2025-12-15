/**
 * Curated Popular Actors
 * ======================
 * A curated list of popular and learning-friendly Apify actors.
 */

import type { PopularActor } from "../types/apify";

export const POPULAR_ACTORS: PopularActor[] = [
  // =========================================================================
  // AI/LLM Data Extraction
  // =========================================================================
  {
    id: "apify/website-content-crawler",
    name: "Website Content Crawler",
    description:
      "Crawl websites and extract text content for AI models, LLM applications, vector databases, or RAG pipelines. Supports Markdown output.",
    category: "ai-llm",
    difficulty: "beginner",
    estimatedCost: "low",
    documentationUrl: "https://apify.com/apify/website-content-crawler",
    exampleInput: {
      startUrls: [{ url: "https://docs.apify.com" }],
      maxCrawlPages: 10,
      crawlerType: "playwright:firefox",
    },
  },
  {
    id: "apify/rag-web-browser",
    name: "RAG Web Browser",
    description:
      "Web browser for OpenAI Assistants and RAG pipelines. Queries Google Search, scrapes top pages, returns Markdown content.",
    category: "ai-llm",
    difficulty: "beginner",
    estimatedCost: "low",
    documentationUrl: "https://apify.com/apify/rag-web-browser",
    exampleInput: {
      query: "what is web scraping",
      maxResults: 3,
    },
  },
  {
    id: "apify/cheerio-scraper",
    name: "Cheerio Scraper",
    description:
      "Fast HTTP-based web scraper using Cheerio. Great for static websites that don't require JavaScript rendering.",
    category: "ai-llm",
    difficulty: "intermediate",
    estimatedCost: "low",
    documentationUrl: "https://apify.com/apify/cheerio-scraper",
    exampleInput: {
      startUrls: [{ url: "https://news.ycombinator.com" }],
      pageFunction: `async function pageFunction(context) {
        const { $, request } = context;
        const title = $('title').text();
        return { url: request.url, title };
      }`,
    },
  },

  // =========================================================================
  // Social Media
  // =========================================================================
  {
    id: "apify/instagram-scraper",
    name: "Instagram Scraper",
    description:
      "Scrape Instagram posts, profiles, hashtags, comments, and more. Extract photos, videos, and engagement metrics.",
    category: "social-media",
    difficulty: "beginner",
    estimatedCost: "medium",
    documentationUrl: "https://apify.com/apify/instagram-scraper",
    exampleInput: {
      directUrls: ["https://www.instagram.com/apaborena/"],
      resultsLimit: 30,
      resultsType: "posts",
    },
  },
  {
    id: "clockworks/free-tiktok-scraper",
    name: "TikTok Scraper",
    description:
      "Free TikTok scraper to extract video data, user profiles, hashtags, and trending content.",
    category: "social-media",
    difficulty: "beginner",
    estimatedCost: "low",
    documentationUrl: "https://apify.com/clockworks/free-tiktok-scraper",
    exampleInput: {
      profiles: ["tiktok"],
      resultsPerPage: 10,
      shouldDownloadVideos: false,
    },
  },
  {
    id: "apidojo/twitter-scraper-lite",
    name: "Twitter/X Scraper",
    description:
      "Scrape tweets, user profiles, and search results from Twitter/X without API access.",
    category: "social-media",
    difficulty: "beginner",
    estimatedCost: "medium",
    documentationUrl: "https://apify.com/apidojo/twitter-scraper-lite",
    exampleInput: {
      searchTerms: ["web scraping"],
      maxTweets: 100,
      sort: "Latest",
    },
  },
  {
    id: "apify/facebook-posts-scraper",
    name: "Facebook Posts Scraper",
    description:
      "Scrape Facebook posts from public pages and profiles. Extract post content, reactions, and comments.",
    category: "social-media",
    difficulty: "intermediate",
    estimatedCost: "medium",
    documentationUrl: "https://apify.com/apify/facebook-posts-scraper",
    exampleInput: {
      startUrls: [{ url: "https://www.facebook.com/apaborena" }],
      maxPosts: 50,
    },
  },

  // =========================================================================
  // Business Data
  // =========================================================================
  {
    id: "apify/google-maps-scraper",
    name: "Google Maps Scraper",
    description:
      "Extract business data from Google Maps including names, addresses, phone numbers, reviews, and ratings.",
    category: "business-data",
    difficulty: "beginner",
    estimatedCost: "medium",
    documentationUrl: "https://apify.com/apify/google-maps-scraper",
    exampleInput: {
      searchStringsArray: ["restaurants in New York"],
      maxCrawledPlaces: 50,
      language: "en",
    },
  },
  {
    id: "compass/crawler-google-places",
    name: "Google Places Crawler",
    description:
      "Alternative Google Places scraper with detailed business information and contact details.",
    category: "business-data",
    difficulty: "beginner",
    estimatedCost: "medium",
    documentationUrl: "https://apify.com/compass/crawler-google-places",
    exampleInput: {
      searchQuery: "coffee shops",
      location: "San Francisco, CA",
      maxResults: 30,
    },
  },
  {
    id: "bebity/linkedin-profile-scraper",
    name: "LinkedIn Profile Scraper",
    description:
      "Extract public LinkedIn profile data including work experience, education, and skills.",
    category: "business-data",
    difficulty: "intermediate",
    estimatedCost: "high",
    documentationUrl: "https://apify.com/bebity/linkedin-profile-scraper",
    exampleInput: {
      profileUrls: ["https://www.linkedin.com/in/example/"],
    },
  },

  // =========================================================================
  // E-commerce
  // =========================================================================
  {
    id: "junglee/amazon-product-scraper",
    name: "Amazon Product Scraper",
    description:
      "Scrape Amazon product data including titles, prices, ratings, reviews, and product details.",
    category: "ecommerce",
    difficulty: "beginner",
    estimatedCost: "medium",
    documentationUrl: "https://apify.com/junglee/amazon-product-scraper",
    exampleInput: {
      categoryUrls: ["https://www.amazon.com/s?k=laptop"],
      maxItems: 100,
    },
  },
  {
    id: "epctex/ebay-scraper",
    name: "eBay Scraper",
    description:
      "Extract eBay listings, auctions, and product data including prices, sellers, and item details.",
    category: "ecommerce",
    difficulty: "beginner",
    estimatedCost: "medium",
    documentationUrl: "https://apify.com/epctex/ebay-scraper",
    exampleInput: {
      searchQuery: "vintage watches",
      maxItems: 100,
    },
  },

  // =========================================================================
  // Developer Tools
  // =========================================================================
  {
    id: "apify/web-scraper",
    name: "Web Scraper",
    description:
      "Generic web scraper with custom JavaScript page functions. Uses headless Chrome to render dynamic content.",
    category: "developer-tools",
    difficulty: "intermediate",
    estimatedCost: "low",
    documentationUrl: "https://apify.com/apify/web-scraper",
    exampleInput: {
      startUrls: [{ url: "https://example.com" }],
      pageFunction: `async function pageFunction(context) {
        const { $, request } = context;
        return {
          url: request.url,
          title: $('title').text(),
        };
      }`,
    },
  },
  {
    id: "apify/puppeteer-scraper",
    name: "Puppeteer Scraper",
    description:
      "Low-level scraper using Puppeteer for full browser control. Best for complex scraping scenarios.",
    category: "developer-tools",
    difficulty: "advanced",
    estimatedCost: "medium",
    documentationUrl: "https://apify.com/apify/puppeteer-scraper",
    exampleInput: {
      startUrls: [{ url: "https://example.com" }],
      pageFunction: `async function pageFunction(context) {
        const { page, request } = context;
        const title = await page.title();
        return { url: request.url, title };
      }`,
    },
  },
  {
    id: "apify/playwright-scraper",
    name: "Playwright Scraper",
    description:
      "Multi-browser scraper using Playwright. Supports Chromium, Firefox, and WebKit.",
    category: "developer-tools",
    difficulty: "advanced",
    estimatedCost: "medium",
    documentationUrl: "https://apify.com/apify/playwright-scraper",
    exampleInput: {
      startUrls: [{ url: "https://example.com" }],
      pageFunction: `async function pageFunction(context) {
        const { page, request } = context;
        const title = await page.title();
        return { url: request.url, title };
      }`,
    },
  },
];

/**
 * Get actors by category
 */
export function getActorsByCategory(category: string): PopularActor[] {
  return POPULAR_ACTORS.filter((actor) => actor.category === category);
}

/**
 * Get actors by difficulty
 */
export function getActorsByDifficulty(difficulty: string): PopularActor[] {
  return POPULAR_ACTORS.filter((actor) => actor.difficulty === difficulty);
}

/**
 * Search actors by name or description
 */
export function searchActors(query: string): PopularActor[] {
  const lowerQuery = query.toLowerCase();
  return POPULAR_ACTORS.filter(
    (actor) =>
      actor.name.toLowerCase().includes(lowerQuery) ||
      actor.description.toLowerCase().includes(lowerQuery) ||
      actor.id.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get a specific actor by ID
 */
export function getActorById(id: string): PopularActor | undefined {
  return POPULAR_ACTORS.find((actor) => actor.id === id);
}

/**
 * Get all unique categories
 */
export function getCategories(): string[] {
  return [...new Set(POPULAR_ACTORS.map((actor) => actor.category))];
}
