import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    allowedHosts: ["react-test", ".react-test", "localhost", "0.0.0.0"],
  },
  preview: {
    host: true,
    port: 3000,
    allowedHosts: ["react-test", ".react-test", "localhost", "0.0.0.0"],
  },
});
