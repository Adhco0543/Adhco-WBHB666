<<<<<<< HEAD
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};
=======
import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname)
  }
};
>>>>>>> f1ee28d4de6942316101091dbedc9f25d2af4638

export default nextConfig;
