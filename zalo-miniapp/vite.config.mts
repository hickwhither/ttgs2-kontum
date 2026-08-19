import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import ZaloMiniApp from "zmp-vite-plugin";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  root: "./src",
  base: "",
  plugins: [tsconfigPaths(), react(), ZaloMiniApp()],
  server: {
    port: 3000,
  },
});
