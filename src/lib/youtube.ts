import { videos as staticVideos, shorts as staticShorts } from "@/content/videos";

export interface YouTubeVideo {
  id: string;
  title: string;
  context: string;
}

export interface YouTubeShort {
  id: string;
  title: string;
  caption: string;
}

/**
 * Return the curated video list.
 */
export async function getLatestVideos(
  count = 2
): Promise<YouTubeVideo[]> {
  return staticVideos.slice(0, count).map((v) => ({
    id: v.id,
    title: v.title,
    context: v.context,
  }));
}

/**
 * Return the curated shorts list.
 */
export async function getShorts(
  count = 2
): Promise<YouTubeShort[]> {
  return staticShorts.slice(0, count).map((s) => ({
    id: s.id,
    title: s.title,
    caption: s.caption,
  }));
}
