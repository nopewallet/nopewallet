import type { Metadata } from "next";
import { ThemeProvider } from "./components/theme-provider"
import { Geist, Geist_Mono } from "next/font/google";
import '@rainbow-me/rainbowkit/styles.css';
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
  title: "Nope Wallet: Open-Source Multi-chain",
  description: "Keep your assets safe and under your full control with open-source all-browser-based wallet without any backend server",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      <link rel="icon" href="/nopewallet_logo_black.png" media="(prefers-color-scheme: light)" />
      <link rel="icon" href="/nopewallet_logo_white.png" media="(prefers-color-scheme: dark)" />
      </head>
      <body>
        <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
        value={{
            light: "light",
            dark: "dark",
            system: "system"
          }}
      >
        {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
