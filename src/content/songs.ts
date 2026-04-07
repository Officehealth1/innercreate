export interface Song {
  id: string;
  title: string;
  duration: string;
  teaser: string;
  story: string;
  soundcloudUrl: string;
  featured?: boolean;
}

export const songs: Song[] = [
  {
    id: "amours",
    title: "Amours",
    duration: "3:42",
    teaser: "The love from the heart guided by the love from the soul",
    story:
      "The love from the heart guided by\nthe love from the soul\nputs everything at the right place and\nbrings light.\nYou will find everything you need.",
    soundcloudUrl: "https://soundcloud.com/florencedhaemer/amours",
    featured: true,
  },
  {
    id: "sur-le-port",
    title: "Sur Le Port",
    duration: "4:15",
    teaser: "In the doing of your talent, you reach all.\nIt\u2019s dawn, the voice is alive, makes the movement real.\nIn your singing all the secrets to repair the past and build your future.",
    story:
      "In the doing of your talent, you reach all.\nIt\u2019s dawn, the voice is alive, makes the movement real.\nIn your singing all the secrets to repair the past and build your future.",
    soundcloudUrl: "https://soundcloud.com/florencedhaemer/sur-le-port",
  },
  {
    id: "refugies",
    title: "R\u00e9fugi\u00e9s",
    duration: "3:58",
    teaser: "Refugees are uprooted from their land\nSearch for a new one\nEven death worths their rude journey\nIf you stop a moment\nSometimes you can feel all of this\nBecause we\u2019re all one.",
    story:
      "Refugees are uprooted from their land\nSearch for a new one\nEven death worths their rude journey\nIf you stop a moment\nSometimes you can feel all of this\nBecause we\u2019re all one.",
    soundcloudUrl: "https://soundcloud.com/florencedhaemer/refugies",
  },
  {
    id: "ocean",
    title: "Oc\u00e9an",
    duration: "4:33",
    teaser: "The ego lost in the ocean\nIs nothing\nYour heart as vast as the ocean\nCan everything\nEven broken hearts will feel complete again",
    story:
      "The ego lost in the ocean\nIs nothing\nYour heart as vast as the ocean\nCan everything\nEven broken hearts will feel complete again",
    soundcloudUrl: "https://soundcloud.com/florencedhaemer/ocean",
  },
  {
    id: "leau-vive",
    title: "L\u2019eau Vive",
    duration: "2:51",
    teaser: "When I feel like water\nRunning through the rocks\nI am both strong and gentle\nThe sun wakes me up\nThe joy fills my heart\nThe ocean enters my chest\nI\u2019m alive",
    story:
      "When I feel like water\nRunning through the rocks\nI am both strong and gentle\nThe sun wakes me up\nThe joy fills my heart\nThe ocean enters my chest\nI\u2019m alive",
    soundcloudUrl: "https://soundcloud.com/florencedhaemer/leau-vive",
  },
];
