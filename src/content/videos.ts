export interface Video {
  id: string;
  title: string;
  context: string;
}

export interface Short {
  id: string;
  title: string;
  caption: string;
}

export const videos: Video[] = [
  {
    id: "5yHq19afhw8",
    title: "Broken",
    context: "",
  },
  {
    id: "kJzyXmh48Xw",
    title: "Woman",
    context:
      "What is it to be a woman?\nWhen I resist her, I lose him\nWhen I trust him, I find her again",
  },
];

export const shorts: Short[] = [
  {
    id: "B98JPGsCpEA",
    title: "Back to you",
    caption: "I'm a human soul, I'm landing on earth",
  },
  {
    id: "jpT6EpbxXR8",
    title: "Shooting star (piano)",
    caption: "Love is where heaven lands",
  },
];
