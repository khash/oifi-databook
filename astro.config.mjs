// @ts-check

import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"

import cloudflare from "@astrojs/cloudflare";

function unlinkCheckIntegration() {
  return {
    name: "unlink-check",
    hooks: {
      async "astro:build:start"() {
        const { checkUnlinkedReferences } = await import(
          "./src/scripts/check-unlinked-references.mjs"
        )
        checkUnlinkedReferences()
      },
      async "astro:server:start"() {
        const { checkUnlinkedReferences } = await import(
          "./src/scripts/check-unlinked-references.mjs"
        )
        checkUnlinkedReferences()
      },
    },
  }
}

function graphDataIntegration() {
  return {
    name: "graph-data",
    hooks: {
      /** Generate graph-data.json before pages are built */
      async "astro:build:start"() {
        const { generateGraphData } = await import(
          "./src/scripts/generate-graph-data.mjs"
        )
        generateGraphData()
        console.log("[graph-data] public/graph-data.json generated")
      },
      /** Also generate on dev server start */
      async "astro:server:start"() {
        const { generateGraphData } = await import(
          "./src/scripts/generate-graph-data.mjs"
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

  integrations: [react(), sitemap(), graphDataIntegration(), unlinkCheckIntegration()],
  adapter: cloudflare()
})