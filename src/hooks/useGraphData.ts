import { useState, useEffect } from "react"
import type { GraphData } from "@/lib/graph-types"

let cached: GraphData | null = null
let fetchPromise: Promise<GraphData> | null = null

function fetchGraphData(): Promise<GraphData> {
  if (cached) return Promise.resolve(cached)
  if (!fetchPromise) {
    fetchPromise = fetch("/graph-data.json")
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch graph data: ${r.status}`)
        return r.json()
      })
      .then((d: GraphData) => {
        cached = d
        return d
      })
      .catch((err) => {
        fetchPromise = null // allow retry
        throw err
      })
  }
  return fetchPromise
}

export function useGraphData() {
  const [data, setData] = useState<GraphData | null>(cached)
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cached) return
    fetchGraphData()
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load graph data")
        setLoading(false)
      })
  }, [])

  return { data, loading, error }
}
