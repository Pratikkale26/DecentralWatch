import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {ClerkProvider} from '@clerk/nextjs'
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import WalletContextProvider from "@/components/WalletAdaptors";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DecentralWatch",
  description: "DecentralWatch is a decentralized uptime monitoring platform where validators across the globe report website uptime and get incentivized for their contributions. Say goodbye to centralized monitoring failures - DecentralWatch ensures a trustless, transparent, and community-driven approach to website reliability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <WalletContextProvider>

          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
              <Header />
            {children}
          </body>
          </WalletContextProvider>
        </ThemeProvider>
      </ClerkProvider>
    </html>
  );
}
