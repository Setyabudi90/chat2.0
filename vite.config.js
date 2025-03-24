import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      generateScopedName:
        "chats_[hash:base64:5]  _[hash:base64:6]_ [hash:base64:7] [hash:base64:8]",
    },
  },
});
