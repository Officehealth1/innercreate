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
    teaser: "A French ode to the many faces of love",
    story:
      "Amours is Florence at her most tender. Sung entirely in French, it moves through the different shapes love takes \u2014 the kind that stays, the kind that leaves, and the kind you carry without knowing. It\u2019s not a love song in the traditional sense. It\u2019s a map of every love that ever mattered.",
    soundcloudUrl: "https://soundcloud.com/florencedhaemer/amours",
    featured: true,
  },
  {
    id: "sur-le-port",
    title: "Sur Le Port",
    duration: "4:15",
    teaser: "Watching life unfold from the harbour\u2019s edge",
    story:
      "Written during a summer spent near the coast, Sur Le Port captures the stillness of watching boats come and go. There\u2019s something meditative about harbours \u2014 they hold both arrivals and departures at once. Florence wrote this one sitting on a bench, feet dangling over the water, humming until the melody stuck.",
    soundcloudUrl: "https://soundcloud.com/florencedhaemer/sur-le-port",
  },
  {
    id: "refugies",
    title: "R\u00e9fugi\u00e9s",
    duration: "3:58",
    teaser: "For those who had to leave everything behind",
    story:
      "R\u00e9fugi\u00e9s is the most urgent song Florence has written. It came from a place of witnessing \u2014 news stories that stopped being stories and started being people. The song doesn\u2019t offer answers. It sits with the displacement, the loss, and the impossible courage of starting over in a language you don\u2019t yet speak.",
    soundcloudUrl: "https://soundcloud.com/florencedhaemer/refugies",
  },
  {
    id: "ocean",
    title: "Oc\u00e9an",
    duration: "4:33",
    teaser: "The pull of something vast and unknowable",
    story:
      "Oc\u00e9an began as a piano improvisation that Florence couldn\u2019t stop playing. The melody kept circling back, like waves. She added lyrics weeks later, but the feeling was always the same \u2014 that sense of standing at the edge of something enormous and letting it wash over you. It\u2019s her most-loved track for a reason.",
    soundcloudUrl: "https://soundcloud.com/florencedhaemer/ocean",
  },
  {
    id: "leau-vive",
    title: "L\u2019eau Vive",
    duration: "2:51",
    teaser: "Living water \u2014 always moving, never the same",
    story:
      "L\u2019eau Vive is Florence\u2019s interpretation of flowing, restless energy. The title translates to \u201cliving water\u201d \u2014 water that moves, that refuses to be still. It\u2019s the shortest piece in her catalogue but one that stays with you. Stripped to just voice and guitar, it feels like catching your breath between two larger moments.",
    soundcloudUrl: "https://soundcloud.com/florencedhaemer/leau-vive",
  },
];
