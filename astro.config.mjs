// @ts-check

import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"

// https://astro.build/config
export default defineConfig({
  server: {
    port: 8321,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
})
