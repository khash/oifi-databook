# Organisations

Each file is a single Org entity as JSON.

**Filename**: `{id}.json` (e.g. `org-abc123def.json`)

## Schema

| Field       | Type       | Required | Notes                                                        |
|-------------|------------|----------|--------------------------------------------------------------|
| id          | string     | yes      | `org-` prefix + 9 random chars                               |
| slug        | string     | yes      | SEO-friendly URL slug (lowercase, hyphenated, ASCII)         |
| name_en     | string     | yes      |                                                              |
| name_fa     | string     | yes      |                                                              |
| type        | enum       | yes      | political-party, state-institution, military, media, business, ngo, religious |
| founded     | number     | no       | Year                                                         |
| dissolved   | number     | no       | Year                                                         |
| parent_org  | string     | no       | Org ID reference                                             |
| description | markdown   | yes      |                                                              |
| faction     | enum       | no       | Same values as Person                                        |
| editorial_notes | markdown | no   | Internal only — never published                              |
