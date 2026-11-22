import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DeepLink Pro — VIP Unlocked",
    short_name: "DeepLink VIP",
    description: "Personal Mobile Smart Link Generator & Redirect Engine. Zero login, permanent local storage.",
    start_url: "/app",
    display: "standalone",
    background_color: "#07080a",
    theme_color: "#10b981",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
