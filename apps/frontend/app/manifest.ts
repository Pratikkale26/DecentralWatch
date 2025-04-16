import type { MetadataRoute } from "next";

const { appName, description } = {
  appName: "Uptora",
  description:
    "Uptora is a decentralized uptime monitoring platform where validators across the globe report website uptime and get incentivized for their contributions. Say goodbye to centralized monitoring failures - Uptora ensures a trustless, transparent, and community-driven approach to website reliability.",
};

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appName,
    short_name: appName,
    description: description,
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}