# tomo-packs — guide for contributors and coding agents

School packs for [Tomo](https://github.com/tkyu-labs/tomo). A pack adds one school's knowledge, skills and first-run
questionnaire (Hatch); Tomo itself knows no school. `README.md` describes the layout, `CONTRIBUTING.md` the pull
request rules; `packs/shonan-it/` is the reference pack. `CLAUDE.md` imports this file for Claude Code.

## Ground rules

- **Who it is for.** Students, many of them not IT people. Skills answer plainly, ask as rarely as possible (the
  school's official site is trusted: no question before reading or downloading from it) and cite their source.
- **No personal data in this repository, ever.** No names, student numbers, grades, timetables, screenshots or page
  dumps from a real account — not in skills, references, examples, tests or commit messages. Examples use fictional
  values (`Lin Mei`, `{{STUDENT_NUMBER}}`). Identifiers appear only as Hatch placeholders.
- **No credentials.** A skill never asks for, stores or types a password. The student signs in themselves in Tomo's
  visible browser.
- **Read-only by default.** Portal skills look things up; registering, cancelling, submitting or changing settings
  stays with the student (the skill says which button to press, the student presses it).
- **No engine plugins, no secrets, no large files.** Code runs as skills or MCP servers; indexes are built on the
  user's computer by `data/build.py`.
- **Three languages** for every user-facing text (en, zh, ja). Skill bodies are English; quote the school's own terms
  in the original language (Japanese UI labels exactly as shown).
- **Works on older Tomo versions.** Use fallbacks (e.g. `${TOMO_DOWNLOADS:-…}`); set `requires.tomo` in `pack.yaml`
  (a Tomo version number) only when a skill cannot work at all on older versions.
- After any change: `python tools/validate.py --write`, then commit the updated `pack.lock` and `catalog.json`.
  Commit messages: Conventional Commits with the pack id as scope, `feat(shonan-it): add syllabus search`.

## Skill format

`packs/<id>/skills/<name>/SKILL.md` with YAML front matter (`name` = folder name, `description`, `version`,
`platforms`, `metadata.tomo.title` and `metadata.tomo.summary` in en/zh/ja), then these sections:
**When to Use** (example questions; what not to use it for), **Rules**, **Procedure** (numbered steps, each with a
"done when"), **Interpretation** (what the numbers and labels mean), **Pitfalls**, **Verification**. Long material
goes to `references/*.md` next to it. List every skill in `pack.yaml` → `skills`. See
`packs/shonan-it/skills/campussquare/` (portal) and `packs/shonan-it/skills/school-info/` (official website).

Tools a skill can rely on in Tomo: `browser_*` (Tomo's visible browser; `browser_console` evaluates a JS expression
and awaits promises), `web_search` / `web_extract`, `terminal` (bash, also on Windows; `curl`), `read_file` (reads
text PDFs locally), `clarify` (questions with choices), `memory`.

## Your first portal skill (agent walkthrough)

Use this when a developer asks you to write the skill for their school's student portal (時間割, 成績, 単位, …).
You need a browser tool that controls the developer's own browser (for example a Playwright or Chrome DevTools MCP
server attached to their Chrome). The developer uses **their own account**; another student's account only with that
student's explicit consent.

1. **Set up the pack.** If `packs/<id>/` does not exist, copy the structure of `packs/shonan-it` (id = the school's
   domain without the suffix: `example-u` for `example-u.ac.jp`), then replace every school-specific value.
2. **The developer signs in.** Open the portal's start page and ask the developer to sign in in the browser window.
   Never type a user name or password, never read or store cookies or tokens. Continue when they say they are in.
3. **Map the menu.** List the menu entries and the URL each one opens. Prefer stable URLs (flow ids, page ids)
   over URLs with a session key; note which part of a URL expires. Record the sign-in form's labels and the sign-out
   URL. Note the session timeout if the page shows one.
4. **Visit every page, structure only.** For each page, collect with a script (not screenshots): title, header
   labels, filter forms (field names, options, defaults), table headers, row levels, buttons and links, footnotes
   (`※…`). Write down what the page is for and which values a question would need. **Do not copy values**: replace
   them with types or fictional examples when you write them down (`GPA: 0.00–4.00`, `科目名【教員】`).
5. **Classify every action.** Safe: opening pages, changing display filters, buttons that only compute or show
   (`表示`, `判定`). Forbidden: registration / cancellation, saving settings, downloads/exports, anything that sends,
   adds or deletes. The skill's Rules list both by their exact labels.
6. **Write extraction snippets.** One `browser_console` expression per kind of question that returns compact JSON
   (only the needed columns, header tables with name / student number skipped). Run each on the real page and check
   the shape and counts; never paste the output into the repository. Put them in `references/extract.md`.
7. **Find the official rules.** Grading marks, GPA, attendance limits, graduation and progression requirements:
   take them from the school's public website and cite the URL in the skill. Where the rule is the instructor's
   (late arrivals, extra conditions), say so and point to the syllabus instead of inventing a rule.
8. **Look for differences.** Pages often differ by year, faculty or status (e.g. a self-check that judges a
   progression requirement in lower years). If other students agree to show their pages, compare structure only and
   note the differences; otherwise list what you could not check.
9. **Write the skill** (`SKILL.md`, `references/pages.md`, `references/extract.md`) in the format above. Rules must
   include: the student signs in; read-only; read only while the student is present; sign out when done.
10. **Declare the permissions** in `pack.yaml`: the portal's origin in `permissions.browser_origins` (where Tomo may
    fill placeholders) and in `permissions.personal_origins` (Tomo then shows the model only headings and controls
    there and asks the student before sending any value read on it), `personal_data` (what it reads), and
    `personal_consent` if a Hatch question lets students refuse (see `grades_consent` in `packs/shonan-it`). Add quick
    topics in `ui` that name the skill.
11. **Clean up and check.** Delete every snapshot, page dump or log your browser tool saved (they contain the
    developer's personal data) and make sure none of it is in the working tree (`git status`). Run
    `python tools/validate.py --write`. Then try the skill in Tomo with the developer watching, and open a pull request.

## Version numbers

Tomo, every pack (`pack.yaml` → `version`) and every skill (`SKILL.md` → `version`) use **MAJOR.MINOR.PATCH**, each
counted on its own:

- **MAJOR** is raised only by a maintainer. A coding agent never raises it.
- **MINOR** goes up when a feature is added or removed (then PATCH starts again at 0).
- **PATCH** goes up for fixes and improvements of existing features.
- **No carry-over**: the numbers are not decimals. After `0.1.9` comes `0.1.10`, then `0.1.11`, …; only a new or
  removed feature makes it `0.2.0`. If you cannot tell whether a change is a feature or a fix, ask the maintainer.
- Compare with the last released version (Tomo: the last release; packs: what is on `main`): several changes before
  one release get one bump (the largest kind among them).

## Checking

```sh
pip install -r tools/requirements.txt
python tools/validate.py          # what CI runs on every pull request
python tools/validate.py --write  # update pack.lock files and catalog.json
```

No tags or releases: `main` is the current version of every pack, and Tomo updates installed packs from it (it
compares the catalog's `lock_sha256` and checks every file against `pack.lock`, so commit what `validate.py --write`
produced). Bump the pack's `version` (see Version numbers) and add a `CHANGELOG.md` entry with every change that
reaches `main` — Tomo shows that entry as "What's new". Breaking Hatch changes also bump `hatch.yaml` → `version` (a
single counter: 1, 2, 3, …).
