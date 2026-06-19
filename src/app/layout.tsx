import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Florence D'haemer — French Singer-Songwriter | Original Music & Stories",
  description:
    "Florence D'haemer is a French singer-songwriter crafting intimate acoustic songs in French and English. Listen to her single Woman, plus Amours and Océan, and watch her live sessions.",
  keywords: [
    "Florence D'haemer",
    "Florence Dhaemer",
    "French singer-songwriter",
    "chanteuse française",
    "original music",
    "acoustic songs",
    "Woman",
    "Woman Florence D'haemer",
    "Amours",
    "Sur Le Port",
    "Réfugiés",
    "Océan",
    "innercreate",
    "live sessions",
    "indie folk",
  ],
  metadataBase: new URL("https://innercreate.com"),
  alternates: {
    canonical: "https://innercreate.com",
  },
  openGraph: {
    title: "Florence D'haemer — French Singer-Songwriter",
    description:
      "Intimate acoustic songs in French and English. Listen to the new single Woman, watch live sessions, and discover the stories behind every song.",
    url: "https://innercreate.com",
    siteName: "innercreate",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Florence D'haemer — French Singer-Songwriter",
    description:
      "New single Woman out now — intimate acoustic songs in French and English. Listen on innercreate.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MusicGroup",
      "@id": "https://innercreate.com/#artist",
      name: "Florence D'haemer",
      url: "https://innercreate.com",
      description:
        "French singer-songwriter crafting intimate acoustic songs in French and English. Music born from real moments — quiet, honest, and deeply personal.",
      genre: ["Singer-Songwriter", "Indie Folk", "Chanson Française"],
      sameAs: [
        "https://www.youtube.com/@florencedhaemer",
        "https://soundcloud.com/florencedhaemer",
        "https://instagram.com/florencedhaemer",
      ],
      track: [
        {
          "@type": "MusicRecording",
          name: "Woman",
          url: "https://soundcloud.com/florencedhaemer/woman",
          duration: "PT2M38S",
          inLanguage: "en",
        },
        {
          "@type": "MusicRecording",
          name: "Amours",
          url: "https://soundcloud.com/florencedhaemer/amours",
          duration: "PT3M42S",
          inLanguage: "fr",
        },
        {
          "@type": "MusicRecording",
          name: "Sur Le Port",
          url: "https://soundcloud.com/florencedhaemer/sur-le-port",
          duration: "PT4M15S",
          inLanguage: "fr",
        },
        {
          "@type": "MusicRecording",
          name: "Réfugiés",
          url: "https://soundcloud.com/florencedhaemer/refugies",
          duration: "PT3M58S",
          inLanguage: "fr",
        },
        {
          "@type": "MusicRecording",
          name: "Océan",
          url: "https://soundcloud.com/florencedhaemer/ocean",
          duration: "PT4M33S",
          inLanguage: "fr",
        },
        {
          "@type": "MusicRecording",
          name: "L'eau Vive",
          url: "https://soundcloud.com/florencedhaemer/leau-vive",
          duration: "PT2M51S",
          inLanguage: "fr",
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://innercreate.com/#website",
      url: "https://innercreate.com",
      name: "innercreate",
      description: "The official home of Florence D'haemer's music and stories",
      publisher: { "@id": "https://innercreate.com/#artist" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
