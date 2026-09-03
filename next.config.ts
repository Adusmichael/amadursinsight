import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a fully static site into ./out for shared hosting (Namecheap / cPanel).
  output: "export",
  // No Next image-optimisation server on static hosting.
  images: { unoptimized: true },
  // Serve /about as /about/index.html cleanly under Apache.
  trailingSlash: true,
};

export default nextConfig;
