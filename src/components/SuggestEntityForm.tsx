import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const FORMS_API = "https://ozgivaw2k7.execute-api.us-east-2.amazonaws.com/prod/submit"

interface Props {
  initialName?: string
  onSuccess?: () => void
  compact?: boolean
}

export function SuggestEntityForm({ initialName = "", onSuccess, compact = false }: Props) {
  const [name, setName] = useState(initialName)
  const [nameFa, setNameFa] = useState("")
  const [entityType, setEntityType] = useState("")
  const [description, setDescription] = useState("")
  const [sources, setSources] = useState("")
  const [submitterEmail, setSubmitterEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !entityType) return

    setStatus("loading")
    setErrorMsg("")

    try {
      const res = await fetch(FORMS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "suggest-entity",
          site: "oifi",
          name: name.trim(),
          name_fa: nameFa.trim() || undefined,
          entity_type: entityType,
          description: description.trim() || undefined,
          sources: sources.trim() || undefined,
          submitter_email: submitterEmail.trim() || undefined,
        }),
      })

      if (res.ok) {
        setStatus("success")
        onSuccess?.()
      } else {
        const data = await res.json()
        setErrorMsg(data.message || "Something went wrong")
        setStatus("error")
      }
    } catch {
      setErrorMsg("Network error — please try again")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
        Thank you — we'll review your suggestion.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!compact && (
        <p className="text-sm text-muted-foreground">
          Help us expand the database by suggesting a person, organization, or event.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="sf-name" className="text-xs text-muted-foreground">Name (English) *</label>
          <Input
            id="sf-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ali Khamenei"
            required
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="sf-name-fa" className="text-xs text-muted-foreground">Name (Persian)</label>
          <Input
            id="sf-name-fa"
            value={nameFa}
            onChange={(e) => setNameFa(e.target.value)}
            placeholder="نام فارسی"
            dir="rtl"
            lang="fa"
            className="h-8 text-sm"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="sf-type" className="text-xs text-muted-foreground">Type *</label>
        <Select value={entityType} onValueChange={setEntityType} required>
          <SelectTrigger id="sf-type" className="h-8 text-sm">
            <SelectValue placeholder="Person, Organization, or Event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="person">Person</SelectItem>
            <SelectItem value="org">Organization</SelectItem>
            <SelectItem value="event">Event</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label htmlFor="sf-description" className="text-xs text-muted-foreground">What you know about them</label>
        <Textarea
          id="sf-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Role, background, significance…"
          rows={compact ? 2 : 3}
          className="text-sm resize-none"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="sf-sources" className="text-xs text-muted-foreground">Sources or links</label>
        <Textarea
          id="sf-sources"
          value={sources}
          onChange={(e) => setSources(e.target.value)}
          placeholder="Wikipedia, news articles, official pages…"
          rows={compact ? 2 : 3}
          className="text-sm resize-none"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="sf-email" className="text-xs text-muted-foreground">Your email (optional)</label>
        <Input
          id="sf-email"
          type="email"
          value={submitterEmail}
          onChange={(e) => setSubmitterEmail(e.target.value)}
          placeholder="For follow-up questions"
          className="h-8 text-sm"
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-destructive">{errorMsg}</p>
      )}
      <Button
        type="submit"
        disabled={status === "loading" || !name.trim() || !entityType}
        size="sm"
      >
        {status === "loading" ? "Sending…" : "Submit suggestion"}
      </Button>
    </form>
  )
}
