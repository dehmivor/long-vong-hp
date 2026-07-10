import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// Load the monorepo-root .env so a single source of truth feeds every app.
const rootDir = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(rootDir, "../../.env") });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/api-client", "@repo/types"],
};

export default nextConfig;
