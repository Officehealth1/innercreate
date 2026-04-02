export interface Video {
  id: string;
  title: string;
  context: string;
}

// Replace these IDs with Florence's actual YouTube video IDs
export const videos: Video[] = [
  {
    id: "VIDEO_ID_1",
    title: "Still Morning \u2014 Live Session",
    context:
      "Filmed in one take at golden hour. No retakes, no edits. Just the song as it wanted to be heard.",
  },
  {
    id: "VIDEO_ID_2",
    title: "Writing Paper Walls \u2014 Behind the Song",
    context:
      "A look at how a two-year-old poem became a song in a single evening. Florence walks through the process, the doubts, and the moment it clicked.",
  },
  {
    id: "VIDEO_ID_3",
    title: "Covers & Conversations",
    context:
      "Florence plays songs that shaped her and talks about why they matter. Music that made her want to make music.",
  },
];
