import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Disable cache di production build
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
