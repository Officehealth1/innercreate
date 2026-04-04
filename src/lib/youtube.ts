import { videos as staticVideos } from "@/content/videos";

export interface YouTubeVideo {
  id: string;
  title: string;
  context: string;
  publishedAt?: string;
}

const CHANNEL_ID = "UC1ZKrxprWW327Q43DCoBIyA";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

/**
 * Fetch latest videos from YouTube's public RSS feed.
 * Falls back to the static list if the feed is unreachable.
 * Revalidates every 6 hours at build/ISR time.
 */
export async function getLatestVideos(
  count = 7
): Promise<YouTubeVideo[]> {
  try {
    const res = await fetch(FEED_URL, {
      next: { revalidate: 21600 }, // 6 hours
    });

    if (!res.ok) throw new Error(`Feed returned ${res.status}`);

    const xml = await res.text();
    const videos = parseYouTubeFeed(xml, count);

    if (videos.length === 0) throw new Error("No videos parsed");

    return videos;
  } catch {
    // Fall back to static video list
    return staticVideos.map((v) => ({
      id: v.id,
      title: v.title,
      context: v.context,
    }));
  }
}

function parseYouTubeFeed(xml: string, count: number): YouTubeVideo[] {
  const entries: YouTubeVideo[] = [];

  // Match each <entry> block
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null && entries.length < count) {
    const entry = match[1];

    const videoId = extract(entry, /<yt:videoId>(.*?)<\/yt:videoId>/);
    const title = extract(entry, /<title>(.*?)<\/title>/);
    const published = extract(entry, /<published>(.*?)<\/published>/);

    if (videoId && title) {
      entries.push({
        id: videoId,
        title: decodeXmlEntities(title),
        context: generateContext(title),
        publishedAt: published ?? undefined,
      });
    }
  }

  return entries;
}

function extract(text: string, regex: RegExp): string | null {
  const m = text.match(regex);
  return m ? m[1] : null;
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

/** Match context from static list, or generate a default. */
function generateContext(title: string): string {
  const staticMatch = staticVideos.find(
    (v) => v.title.toLowerCase() === title.toLowerCase()
  );
  if (staticMatch) return staticMatch.context;

  return `A live session by Florence D'Haemer — watch, listen, and feel the music as it was meant to be heard.`;
}
