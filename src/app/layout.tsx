import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lenny Advisor",
  description:
    "AI-powered answers grounded in 300+ episodes of Lenny's Podcast. Ask anything about product, growth, career, and leadership.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Instrument+Serif&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f5f0e8] text-[#1a1a1a] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
