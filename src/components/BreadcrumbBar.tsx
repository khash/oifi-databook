import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { GraphData } from "@/lib/graph-types"
import { Fragment } from "react"

interface BreadcrumbBarProps {
  breadcrumbs: string[]
  data: GraphData
  onNavigate: (id: string) => void
}

export function BreadcrumbBar({ breadcrumbs, data, onNavigate }: BreadcrumbBarProps) {
  if (breadcrumbs.length <= 1) return null

  // Show at most 5 crumbs, truncate older ones
  const visible = breadcrumbs.length > 5
    ? [breadcrumbs[0], "...", ...breadcrumbs.slice(-4)]
    : breadcrumbs

  return (
    <Breadcrumb className="px-4 py-2 text-sm border-b">
      <BreadcrumbList>
        {visible.map((id, i) => {
          const isLast = i === visible.length - 1
          const isEllipsis = id === "..."
          const node = isEllipsis ? null : data.nodes.find((n) => n.id === id)
          const label = node?.label ?? id

          return (
            <Fragment key={`${id}-${i}`}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isEllipsis ? (
                  <span className="text-muted-foreground">…</span>
                ) : isLast ? (
                  <span className="font-medium">{label}</span>
                ) : (
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      onNavigate(id)
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
