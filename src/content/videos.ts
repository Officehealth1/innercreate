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
    id: "g1EqOBpu2mM",
    title: "Grow",
    context:
      "There’s a bridge between\nLife here\nAnd life up there\nMake this connection grow\nAnd become your true self",
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
