/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Webpack konfigürasyonu - önemli: config mutlaka döndürülmeli
    return config;
  },
  // Server Actions için boyut limiti
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb'
    }
  },
  // Sharp paketi için harici paket desteği
  serverExternalPackages: ['sharp'],
  // Image optimizasyonu için domain ayarları
  images: {
    domains: ['localhost'],
  },
  // API route'ları için boyut limitleri
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ];
  },
};

// ESM formatında export
export default nextConfig; 