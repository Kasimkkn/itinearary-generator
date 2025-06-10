/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Avoid static export
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  optimizeFonts: true,
};

module.exports = nextConfig;