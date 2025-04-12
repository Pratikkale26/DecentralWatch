import { Metadata } from "next";

const { title, description, ogImage, baseURL } = {
  title: "Uptora",
  description:
    "Uptora is a decentralized uptime monitoring platform where validators across the globe report website uptime and get incentivized for their contributions. Say goodbye to centralized monitoring failures - Uptora ensures a trustless, transparent, and community-driven approach to website reliability.",
  baseURL: "https://www.uptora.xyz",
  ogImage: `https://uptora.xyz/open-graph.png`,
};

export const siteConfig: Metadata = {
  title,
  description,
  metadataBase: new URL(baseURL),
  openGraph: {
    title,
    description,
    images: [ogImage],
    url: baseURL,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
  icons: {
    icon: "/favicon.ico",
  },
  applicationName: "uptora",
  alternates: {
    canonical: baseURL,
  },
  keywords: [
    "Decentralized Uptime Monitoring",
    "Blockchain Data",
    "Solana Indexing",
    "Real-time Uptime Monitoring",
    "Solana API",
    "Incentivized Network",
    "Uptime Validation",
    "Trustless Monitoring",
    "Transparent Monitoring",
    "Community-driven Uptime",
    "Blockchain-based Monitoring",
    "Web3 Uptime Monitoring",
    "Validators Network",
    "Solana Validators",
    "Real-time Analytics",
    "Web3 Analytics"
  ],
};
