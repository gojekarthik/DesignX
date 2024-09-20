/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "liveblocks.io",
        pathname: "/avatars/**", // This allows all images from this specific path.
      },
    ]
  },
};

export default nextConfig
