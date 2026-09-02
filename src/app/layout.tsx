import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ascend — Calisthenics & Conditioning Coach",
  description:
    "Train calisthenics in the gym, log your weight and nutrition, and let an AI coach build your progression plan — from your first pull-up to going pro.",
  keywords: [
    "calisthenics",
    "bodyweight training",
    "pull-up progression",
    "weight loss",
    "fitness app",
    "AI workout planner",
  ],
  authors: [{ name: "Ascend" }],
  applicationName: "Ascend",
  appleWebApp: {
    capable: true,
    title: "Ascend",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon-32.png"],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Ascend — Calisthenics & Conditioning Coach",
    description:
      "From your first pull-up to going pro. Train, track, and let AI coach your progression.",
    siteName: "Ascend",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <Toaster />
            <Sonner />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
