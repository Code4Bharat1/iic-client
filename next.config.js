if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not set (frontend/.env.local)');
}
// Strip any trailing slash(es) so the rewrite destination never ends up with
// a double slash (e.g. NEXT_PUBLIC_API_URL="https://host.com/" -> ".com//uploads/...").
const API_URL = process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${API_URL}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
