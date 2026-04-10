import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { GraphNode, GraphEdge, GraphData } from "@/lib/graph-types"
import type { Person, Org, Event } from "@/lib/types"

interface ProfilePanelProps {
  node: GraphNode
  edges: GraphEdge[]
  data: GraphData
  onEntityClick: (id: string) => void
}

const confidenceClass: Record<string, string> = {
  confirmed: "border-teal-500 text-teal-700 dark:text-teal-400",
  alleged: "border-amber-500 text-amber-700 dark:text-amber-400",
  disputed: "border-blue-500 text-blue-700 dark:text-blue-400",
  denied: "border-gray-400 text-gray-500 dark:text-gray-400",
}

function entityName(data: GraphData, id: string): string {
  const n = data.nodes.find((n) => n.id === id)
  return n?.label ?? id
}

function PersonProfile({ person, edges, data, onEntityClick }: { person: Person; edges: GraphEdge[]; data: GraphData; onEntityClick: (id: string) => void }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold">{person.name_en}</h2>
        <Badge variant="secondary">{person.faction.replace(/-/g, " ")}</Badge>
      </div>
      <p className="mt-1 text-lg text-muted-foreground" dir="rtl" lang="fa">{person.name_fa}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {person.role}
        {person.born && <span> &middot; Born {person.born}</span>}
        {person.birthplace && <span> &middot; {person.birthplace}</span>}
      </p>
      <Separator className="my-4" />
      <p className="text-sm">{person.bio}</p>
      {person.expertise.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-xs font-medium text-muted-foreground">Expertise</h3>
          <div className="flex flex-wrap gap-1.5">
            {person.expertise.map((tag) => (
              <Badge key={tag} variant="outline">{tag.replace(/-/g, " ")}</Badge>
            ))}
          </div>
        </div>
      )}
      <ConnectionsList entityId={person.id} edges={edges} data={data} onEntityClick={onEntityClick} />
    </>
  )
}

function OrgProfile({ org, edges, data, onEntityClick }: { org: Org; edges: GraphEdge[]; data: GraphData; onEntityClick: (id: string) => void }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold">{org.name_en}</h2>
        <Badge variant="secondary">{org.type.replace(/-/g, " ")}</Badge>
        {org.faction && <Badge variant="outline">{org.faction.replace(/-/g, " ")}</Badge>}
      </div>
      <p className="mt-1 text-lg text-muted-foreground" dir="rtl" lang="fa">{org.name_fa}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {org.founded && <span>Founded {org.founded}</span>}
        {org.dissolved && <span> &middot; Dissolved {org.dissolved}</span>}
      </p>
      <Separator className="my-4" />
      <p className="text-sm">{org.description}</p>
      <ConnectionsList entityId={org.id} edges={edges} data={data} onEntityClick={onEntityClick} />
    </>
  )
}

function EventProfile({ event }: { event: Event }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold">{event.name}</h2>
        <Badge variant="secondary">{event.type.replace(/-/g, " ")}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{event.date}</p>
      <Separator className="my-4" />
      <p className="text-sm">{event.description}</p>
    </>
  )
}

function ConnectionsList({
  entityId,
  edges,
  data,
  onEntityClick,
}: {
  entityId: string
  edges: GraphEdge[]
  data: GraphData
  onEntityClick: (id: string) => void
}) {
  if (edges.length === 0) return null

  return (
    <div className="mt-6">
      <h3 className="mb-2 text-xs font-medium text-muted-foreground">Connections</h3>
      <ul className="space-y-1.5">
        {edges.map((edge) => {
          const otherId = edge.source === entityId ? edge.target : edge.source
          const label = edge.source === entityId
            ? edge.type.replace(/-/g, " ")
            : edge.type.replace(/-/g, " ") + " (inverse)"
          return (
            <li key={edge.id} className="flex items-center gap-2 text-sm">
              <button
                onClick={() => onEntityClick(otherId)}
                className="font-medium hover:underline text-left"
              >
                {entityName(data, otherId)}
              </button>
              <span className="text-muted-foreground">&middot; {label}</span>
              <Badge
                variant="outline"
                className={`ml-auto shrink-0 ${confidenceClass[edge.confidence] ?? ""}`}
              >
                {edge.confidence}
              </Badge>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function ProfilePanel({ node, edges, data, onEntityClick }: ProfilePanelProps) {
  const entity = node.data

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {node.type === "person" && (
          <PersonProfile person={entity as Person} edges={edges} data={data} onEntityClick={onEntityClick} />
        )}
        {node.type === "org" && (
          <OrgProfile org={entity as Org} edges={edges} data={data} onEntityClick={onEntityClick} />
        )}
        {node.type === "event" && (
          <EventProfile event={entity as Event} />
        )}
      </div>
    </ScrollArea>
  )
}
