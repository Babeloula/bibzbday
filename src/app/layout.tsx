import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HB Bibouche ! ❤️",
  description: "Un petit jeu d&apos;anniversaire juste pour toi!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100`}
      >
        {children}
      </body>
    </html>
  );
}
