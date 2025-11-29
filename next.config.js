/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Suppress engine warnings for development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;

