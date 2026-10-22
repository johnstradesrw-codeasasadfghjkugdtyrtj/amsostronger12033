// @lovable.dev/vite-tanstack-config already includes the core plugin stack — do NOT add them manually.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  ...(process.env["VERCEL"] === "1" ? { nitro: { preset: "vercel" } } : {}),
  tanstackStart: {
    server: { entry: "server" },
  },
});
