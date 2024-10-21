/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['replicate'],
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'replicate.delivery',
          port: '',
          pathname: '',
        },
      ],
    },
};

export default nextConfig;
