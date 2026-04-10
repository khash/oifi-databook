import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { FormattedDate } from "@/components/FormattedDate";

interface ConnectionItem {
  type: string;
  confidence: string;
  label: string;
  otherName: string;
  href: string;
  dateFrom?: string;
  dateTo?: string;
}

export function ConnectionsList({ connections }: { connections: ConnectionItem[] }) {
  const [filter, setFilter] = useState("all");

  const uniqueLabels = useMemo(() => {
    const labels = [...new Set(connections.map((c) => c.label))].sort();
    return labels;
  }, [connections]);

  const filtered = filter === "all"
    ? connections
    : connections.filter((c) => c.label === filter);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">Connections</h2>
        {uniqueLabels.length > 1 && (
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {uniqueLabels.map((label) => (
                <SelectItem key={label} value={label}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <ul className="space-y-2">
        {filtered.map((conn, i) => (
          <li key={i}>
            <a href={conn.href} className="text-sm font-medium hover:underline">
              {conn.otherName}
            </a>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>
                {conn.label}
                {conn.dateFrom && (
                  <>
                    {" ("}
                    <FormattedDate date={conn.dateFrom} />
                    {conn.dateTo && (
                      <>
                        {"–"}
                        <FormattedDate date={conn.dateTo} />
                      </>
                    )}
                    {")"}
                  </>
                )}
              </span>
              <ConfidenceBadge confidence={conn.confidence} />
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-xs text-muted-foreground">No connections match this filter.</li>
        )}
      </ul>
    </div>
  );
}
