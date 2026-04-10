import { Handle, Position, type NodeProps } from "@xyflow/react"

interface EntityNodeData {
  label: string
  entityType: string
  selected: boolean
  bg: string
  border: string
  [key: string]: unknown
}

export function EntityNode({ data }: NodeProps) {
  const d = data as EntityNodeData
  const isEvent = d.entityType === "event"
  const isOrg = d.entityType === "org"

  const shapeClass = isOrg ? "rounded-md" : "rounded-full"

  return (
    <div className="flex flex-col items-center gap-1">
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
      {isEvent ? (
        <div
          className={`w-5 h-5 ${d.selected ? "ring-2 ring-offset-1 ring-blue-400" : ""}`}
          style={{
            backgroundColor: d.bg,
            border: `1.5px ${d.selected ? "dashed" : "solid"} ${d.border}`,
            transform: "rotate(45deg)",
          }}
        />
      ) : (
        <div
          className={`w-7 h-7 ${shapeClass} ${d.selected ? "ring-2 ring-offset-1 ring-blue-400" : ""}`}
          style={{
            backgroundColor: d.bg,
            border: `1.5px ${d.selected ? "dashed" : "solid"} ${d.border}`,
          }}
        />
      )}
      <span className="text-[10px] leading-tight text-center max-w-[120px] font-medium text-foreground">
        {d.label}
      </span>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />
    </div>
  )
}
