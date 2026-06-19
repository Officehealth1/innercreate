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
    id: "kJzyXmh48Xw",
    title: "Woman",
    context:
      "What is it to be a woman?\nWhen I resist her, I lose him\nWhen I trust him, I find her again",
  },
  {
    id: "L9MWpcBmYtA",
    title: "Umana",
    context:
      "There is pain\nThere is pressure\nTo make you a more noble human being",
  },
];

export const shorts: Short[] = [
  {
    id: "B98JPGsCpEA",
    title: "Back to you",
    caption: "",
  },
  {
    id: "i4DUNR9Ch5U",
    title: "Shooting star",
    caption: "",
  },
  {
    id: "4oXO60r2rz4",
    title: "Beyond",
    caption: "your soul knows the way",
  },
  {
    id: "zt7tU9Pq0b4",
    title: "Ashes",
    caption: "the soul never dies",
  },
];
