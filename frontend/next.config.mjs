const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination:
          'https://psycare-mvp-2onf.vercel.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;