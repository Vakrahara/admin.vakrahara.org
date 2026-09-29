import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Vakrahara Admin Console",
  description: "Secure administrative portal for the Vakrahara Gurukulam and Project Amrtam.",
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
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://pb.vakrahara.org https://cdn.vakrahara.org https://*.r2.cloudflarestorage.com; img-src 'self' https://cdn.vakrahara.org data: blob:; media-src 'self' https://cdn.vakrahara.org blob:; frame-src 'self' https://cdn.vakrahara.org https://iframe.videodelivery.net; object-src 'none'; base-uri 'self';"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
