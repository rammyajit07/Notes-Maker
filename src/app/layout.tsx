import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Handwriting Generator | Create Realistic Handwritten Notes",
  description: "Convert typed text into realistic human-like handwriting and download as PDF.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Homemade+Apple&family=Caveat:wght@400;700&family=Shadows+Into+Light&family=Inter:wght@400;500;600;700&family=Dancing+Script:wght@400;700&family=Pacifico&family=Reenie+Beanie&family=Nothing+You+Could+Do&family=Just+Me+Again+Down+Here&family=Gochi+Hand&family=Gloria+Hallelujah&family=Indie+Flower&family=Kalam:wght@400;700&family=Zeyada&family=Patrick+Hand&family=Architects+Daughter&family=Neucha&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
