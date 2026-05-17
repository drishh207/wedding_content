import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Great_Vibes,
  Montserrat,
} from "next/font/google";

import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-cormorant",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://v0-wedding-website-loader.vercel.app"),

  title: "Akshit & Shristi Wedding Invitation 2026",

  description:
    "Join us in celebrating the wedding of Akshit & Shristi on 10th & 11th July 2026 at Prangana.",

  generator: "v0.app",

  openGraph: {
    title: "Akshit & Shristi Wedding Invitation 2026",

    description:
      "10th & 11th July 2026 • Prangana • Wedding Celebration",

    url: "https://v0-wedding-website-loader.vercel.app",

    siteName: "Wedding Invitation",

    images: [
      {
        url: "https://v0-wedding-website-loader.vercel.app/preview2.png",
        width: 1200,
        height: 630,
        alt: "Akshit & Shristi Wedding Invitation",
      },
    ],

    type: "website",
  },

  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],

    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${greatVibes.variable} ${montserrat.variable} font-sans antialiased`}
      >
        {children}

        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}