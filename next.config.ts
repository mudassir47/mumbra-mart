import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'firebasestorage.googleapis.com','images.unsplash.com'], // Add Firebase Storage domain
  },
};

export default nextConfig;
