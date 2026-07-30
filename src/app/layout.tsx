import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WebAuthProvider } from "@/components/web/WebAuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlueRock Web",
  description: "BlueRock web experience with property discovery, booking, and auth flows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <WebAuthProvider>{children}</WebAuthProvider>
      </body>
    </html>
  );
}
