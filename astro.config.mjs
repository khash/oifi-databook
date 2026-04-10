// @ts-check

import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"

function graphDataIntegration() {
  return {
    name: "graph-data",
    hooks: {
      /** Generate graph-data.json before pages are built */
      async "astro:build:start"() {
        const { generateGraphData } = await import(
          "./src/scripts/generate-graph-data.ts"
        )
        generateGraphData()
        console.log("[graph-data] public/graph-data.json generated")
      },
      /** Also generate on dev server start */
      async "astro:server:start"() {
        const { generateGraphData } = await import(
          "./src/scripts/generate-graph-data.ts"
        )
        generateGraphData()
        console.log("[graph-data] public/graph-data.json generated (dev)")
      },
    },
  }
}

// https://astro.build/config
export default defineConfig({
  site: "https://databook.oifi.org",
  server: {
    port: 8321,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react(), graphDataIntegration()],
})
