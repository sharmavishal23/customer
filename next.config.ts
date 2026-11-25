import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: deployable to Netlify or any static host.
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
