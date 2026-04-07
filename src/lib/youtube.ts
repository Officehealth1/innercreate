import { videos as staticVideos } from "@/content/videos";

export interface YouTubeVideo {
  id: string;
  title: string;
  context: string;
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
