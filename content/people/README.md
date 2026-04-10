# People

Each file is a single Person entity as JSON.

**Filename**: `{id}.json` (e.g. `person-abc123def.json`)

## Schema

| Field       | Type       | Required | Notes                                                        |
|-------------|------------|----------|--------------------------------------------------------------|
| id          | string     | yes      | `person-` prefix + 9 random chars                            |
| slug        | string     | yes      | SEO-friendly URL slug (lowercase, hyphenated, ASCII)         |
| name_en     | string     | yes      | English name                                                 |
| name_fa     | string     | yes      | Persian name                                                 |
| aliases     | string[]   | yes      | Known alternative names (may be empty)                       |
| born        | number     | no       | Birth year                                                   |
| birthplace  | string     | no       |                                                              |
| role        | string     | yes      | Current or most recent role                                  |
| faction     | enum       | yes      | pragmatist, reformist, conservative, hardliner, technocrat, clerical |
| bio         | markdown   | yes      | Short editorial biography                                    |
| expertise   | string[]   | yes      | Controlled tags                                              |
| photo       | url        | no       |                                                              |
| editorial_notes | markdown | no   | Internal only — never published                              |
