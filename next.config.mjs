// @ts-check

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  typescript: {ignoreBuildErrors: true}, // Variable para omitir errores en el build quitar para que se muestren los errores
  eslint: {
    ignoreDuringBuilds: true, // Variable para omitir errores en el build quitar para que se muestren los errores
  },
  reactStrictMode: true,
  images: {
    domains: ['elasticbeanstalk-us-east-1-232555073760.s3.amazonaws.com'],
  },

  /**
   * If you have the "experimental: { appDir: true }" setting enabled, then you
   * must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};
export default config;
