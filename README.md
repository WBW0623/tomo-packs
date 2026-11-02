# Tomo packs

School packs for [Tomo](https://github.com/tkyu-labs/tomo), a desktop assistant for international students.
Tomo itself knows no school; a pack adds one school's knowledge, skills and first-run questionnaire (Hatch).

Packs are made by the community. They are not affiliated with, endorsed by or maintained by the schools they
describe. Tomo installs packs only from this repository, after checking the release signature.

| Pack | School | Version |
|---|---|---|
| [`shonan-it`](packs/shonan-it) | Shonan Institute of Technology (湘南工科大学) | 0.1.0 (in development) |

## What a pack contains

```
packs/<id>/            id = the school's domain without the suffix, e.g. shonan-it for shonan-it.ac.jp
  pack.yaml            metadata, permissions, trusted sources, quick topics   (schema/pack.schema.json)
  hatch.yaml           first-run questionnaire and placeholders                (schema/hatch.schema.json)
  soul.md              what the assistant needs to know about the school
  skills/<name>/       Hermes skills (SKILL.md)
  mcp/<name>/          optional MCP servers (stdio)
  data/build.py        builds local indexes from public sources (output is not committed)
  evals/cases.yaml     regression questions
  pack.lock            file hashes (generated)
```

Rules that every pack follows:

- **Declarative first.** Permissions, sources, Hatch questions and placeholders are data; Tomo enforces them.
- **No engine plugins.** Code runs as skills or MCP servers, never inside the agent engine.
- **No personal data, no secrets, no large data files.** Identifiers are only placeholders such as
  `{{STUDENT_NUMBER}}`; indexes are built on the user's computer.
- **School systems through the browser only,** with the user's approval for every action.
- **Three languages.** Every user-facing text has English, Chinese and Japanese.

## Checking a pack

```
pip install -r tools/requirements.txt
python tools/validate.py          # what CI runs on every pull request
python tools/validate.py --write  # update pack.lock files and catalog.json after changes
```

Releases are tagged `<id>/v<version>`; the release workflow builds the archive and signs it with Sigstore.

## Licence

Code: MIT (`LICENSE`). Written content: CC BY 4.0 (`LICENSE-CONTENT.md`).
