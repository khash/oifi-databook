# Events

Each file is a single Event entity as JSON.

**Filename**: `{id}.json` (e.g. `event-abc123def.json`)

## Schema

| Field       | Type       | Required | Notes                                                        |
|-------------|------------|----------|--------------------------------------------------------------|
| id          | string     | yes      | `event-` prefix + 9 random chars                             |
| slug        | string     | yes      | SEO-friendly URL slug (lowercase, hyphenated, ASCII)         |
| name        | string     | yes      |                                                              |
| date        | string     | yes      | YYYY or YYYY-MM or YYYY-MM-DD                                |
| type        | enum       | yes      | election, appointment, purge, protest, leak, sanctions, indictment, policy, death |
| description | markdown   | yes      |                                                              |
| sources     | Source[]   | yes      | At least one                                                 |
| editorial_notes | markdown | no   | Internal only — never published                              |

### Source

| Field     | Type   | Required |
|-----------|--------|----------|
| url       | url    | yes      |
| title     | string | yes      |
| date      | string | yes      |
| publisher | string | yes      |
