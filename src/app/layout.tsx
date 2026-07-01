import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-portfolio",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "Visual researcher — portfolio",
  description:
    "Hi. I'm a visual researcher. I'm always rushing to explore the world through the dialogue between the hand, the mind, and the way we perceive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full bg-portfolio-bg font-sans text-portfolio-fg">
        {children}
      </body>
    </html>
  );
}
