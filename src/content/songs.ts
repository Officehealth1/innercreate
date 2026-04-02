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
    id: "still-morning",
    title: "Still Morning",
    duration: "3:42",
    teaser: "Written the morning after everything changed",
    story:
      "This song was born from a single morning\u2014the kind where you wake up and the world feels different, but you can\u2019t explain why. Florence wrote it in one sitting, barely edited. The rawness is the point. Sometimes the truest songs are the ones you don\u2019t overthink.",
    soundcloudUrl: "https://soundcloud.com/florencedhaemer/still-morning",
    featured: true,
  },
  {
    id: "paper-walls",
    title: "Paper Walls",
    duration: "4:15",
    teaser: "About the homes we build that can\u2019t protect us",
    story:
      "Paper Walls started as a poem Florence never intended to sing. It sat in a journal for two years before she picked up her guitar one evening and the melody arrived uninvited. The song is about the illusion of safety\u2014the walls we build from words and promises that dissolve when tested.",
    soundcloudUrl: "https://soundcloud.com/florencedhaemer/paper-walls",
  },
  {
    id: "halfway-home",
    title: "Halfway Home",
    duration: "3:58",
    teaser: "For everyone caught between where they left and where they\u2019re going",
    story:
      "Growing up between cultures means you\u2019re always arriving and always leaving. Halfway Home is Florence\u2019s love letter to that in-between space\u2014the airport terminals, the phone calls across time zones, the feeling of belonging everywhere and nowhere at once.",
    soundcloudUrl: "https://soundcloud.com/florencedhaemer/halfway-home",
  },
  {
    id: "quiet-loud",
    title: "Quiet / Loud",
    duration: "2:51",
    teaser: "The contrast between what we feel and what we show",
    story:
      "This is the shortest song Florence has released, and it took the longest to finish. Three years of rewrites to capture something simple: the gap between how loud things feel inside and how quiet we keep them on the surface. The final version has just voice and guitar\u2014everything else was stripped away.",
    soundcloudUrl: "https://soundcloud.com/florencedhaemer/quiet-loud",
  },
  {
    id: "undercurrent",
    title: "Undercurrent",
    duration: "4:33",
    teaser: "What runs beneath the surface of every conversation",
    story:
      "Undercurrent was recorded live in a single take in Florence\u2019s kitchen at midnight. You can hear the fridge humming in the background if you listen closely. She kept it because it felt real\u2014because music doesn\u2019t need to be perfect to be true. The song is about everything we don\u2019t say, the conversations that happen beneath the ones we\u2019re having.",
    soundcloudUrl: "https://soundcloud.com/florencedhaemer/undercurrent",
  },
];
