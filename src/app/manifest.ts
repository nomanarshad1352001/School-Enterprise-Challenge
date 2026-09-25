import type { MetadataRoute } from "next";

/* PWA manifest — makes the platform installable ("Add to home screen") before
 * the Capacitor wrapper ships it to the app stores. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "School Enterprise Challenge",
    short_name: "SEC",
    description: "Plan, launch and run a real mini-enterprise with your school team.",
    start_url: "/app",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5efe3",
    theme_color: "#082018",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
