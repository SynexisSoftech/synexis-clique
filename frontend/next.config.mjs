/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
     remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        // You can be more specific with the pathname if you wish
        // pathname: '/your_cloud_name/image/upload/**', 
      },
    ],
  },
}

export default nextConfig
