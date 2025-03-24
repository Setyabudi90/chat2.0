import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

function randomClassName() {
  return "_" + Math.random().toString(36).substring(2, 9);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      generateScopedName: randomClassName,
      localsConvention: "camelCase",
      hashPrefix: "prefix",
      scopeBehaviour: "local",
    },
  },
});
