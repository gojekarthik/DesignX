/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config)=>({
    "utf-8-validate":"commonjs utf-8-validate",
    "bufferutil":"commonjs bufferutil",
    canvas : "commonjs canvas"
  }),
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
