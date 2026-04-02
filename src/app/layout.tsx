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
  title: "Florence Dhaemer | Singer-Songwriter | innercreate",
  description:
    "Original music and stories by Florence Dhaemer. Listen to songs born from real moments.",
  metadataBase: new URL("https://innercreate.com"),
  openGraph: {
    title: "Florence Dhaemer | Singer-Songwriter",
    description:
      "Original music and stories by Florence Dhaemer. Listen to songs born from real moments.",
    url: "https://innercreate.com",
    siteName: "innercreate",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Florence Dhaemer | Singer-Songwriter",
    description:
      "Original music and stories by Florence Dhaemer. Listen to songs born from real moments.",
    images: ["/images/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: "Florence Dhaemer",
  url: "https://innercreate.com",
  genre: "Singer-Songwriter",
  sameAs: [
    "https://www.youtube.com/@florencedhaemer",
    "https://soundcloud.com/florencedhaemer",
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
