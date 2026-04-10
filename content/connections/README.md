# Connections

Each file is a single Connection entity as JSON. Connections are first-class entities — not nested inside people, orgs, or events.

**Filename**: `{id}.json` (e.g. `conn-abc123def.json`)

## Schema

| Field          | Type           | Required | Notes                                                     |
|----------------|----------------|----------|-----------------------------------------------------------|
| id             | string         | yes      | `conn-` prefix + 9 random chars                           |
| from_entity    | string         | yes      | Person or Org ID. Events cannot be from-entities.         |
| to_entity      | string         | yes      | Person, Org, or Event ID                                  |
| type           | enum           | yes      | One of 26 relationship types (see below)                  |
| confidence     | enum           | yes      | confirmed, alleged, disputed, denied                      |
| date_from      | string         | no       | YYYY or YYYY-MM or YYYY-MM-DD                             |
| date_to        | string         | no       | Blank = ongoing                                           |
| evidence       | EvidenceItem[] | yes      | At least one required for `confirmed`                     |
| intermediaries | string[]       | no       | Entity IDs that bridge this connection                    |
| symmetric      | boolean        | yes      | Auto-set true for `aligned-with` and `family-of`          |
| family_subtype | enum           | no       | Required when type is `family-of`: spouse, sibling, parent, child |
| editorial_notes| markdown       | no       | Internal only — never published                           |

### EvidenceItem

| Field        | Type   | Required |
|--------------|--------|----------|
| source_url   | url    | yes      |
| source_title | string | yes      |
| source_date  | string | yes      |
| description  | string | yes      |

### Relationship types (26)

**Hierarchical**: reports-to, appointed-by, oversees
**Institutional**: member-of, founded, led, served-in, spokesperson-for, subsidiary-of, affiliated-with, funded-by
**Political**: aligned-with (symmetric), opposed, endorsed, appointed
**Operational**: organized, participated-in, coordinated-with, directed, recruited
**Evidentiary**: named-in, published, testified-in, subject-of
**Personal**: family-of (symmetric), mentor-of
