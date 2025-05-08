/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
  experimental: {
    serverExternalPackages: ['sharp'],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
