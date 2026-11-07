# My Page student academic profile

Use `https://keiouniversity.my.site.com/students/s/MyPage`, reached through `My Page` in K-Support.
Read `../scripts/read-profile.js` and run its complete expression with `browser_console`, editing only `REQUEST`.
This expression is separate from `read-academic.js`, which handles academic-system pages.

## Display procedure

1. Open `My Page` while the student is present. Done when `/students/s/MyPage` and the requested section heading
   appear. If sign-in is required, let the student sign in and confirm completion.
2. Expand only the relevant display accordion listed below. Expanding these sections is a display action;
   do not enter the bank-information accordion or press settings/account save controls.
   Done when the heading button has `aria-expanded="true"` and its content is not `aria-hidden="true"`.
3. Set `REQUEST.fields` to only the requested fields, with `limit` normally 100, at most 500. Run through Tomo's
   normal consent flow. Done when the requested values or explicit missing/empty flags are returned.
4. Answer from the display and cite `My Page`, its section, and the stable URL. Missing history entries mean
   no entries were displayed, not that the student has never taken leave or studied abroad. Do not calculate a
   leave-semester total from dates instead of reading the displayed count.

## Supported fields

| Section | `REQUEST.fields` entry | Exact observed label |
|---|---|---|
| `全般 General` | `program` | `課程 Program：` |
| `全般 General` | `affiliation` | `学部・研究科 Affiliation：` |
| `全般 General` | `department` | `学科・専攻 Department/Major：` |
| `全般 General` | `yearLevel` | `学年 Year Level：` |
| `全般 General` | `class` | `クラス Class：` |
| `全般 General` | `name` | `氏名 Name：` — placeholder object only |
| `全般 General` | `studentNumber` | `学籍番号 Student ID Number：` — placeholder object only |
| `休学・留学歴 History of Temporary Leave of Absence / Study Abroad` | `temporaryLeave` | `休学 Temporary Leave of Absence：` |
| Same history section | `studyAbroad` | `留学 Study Abroad：` |
| `休学学期数 The Number of Temporary Leave of Absence` | `leaveSemesters` | `現在の休学学期数:` |

An affiliation question needs `fields: ["program", "affiliation", "department"]`; a leave-semester question
needs `fields: ["leaveSemesters"]`. Do not request all fields for every question. The default excludes identifiers.

## Data shape and privacy

The page uses Salesforce Flow rich text, native shadow roots, and assigned slots inside Lightning accordions.
Traverse the composed structure with deduplication; document-level selectors and shadow-root-only walks miss
these fields. Content slots point to the actual Flow content via `assignedElements`.

The verified General layout uses list items with one `strong` label followed by value spans. Match exact
allowlisted labels inside the requested section, then read the rest of that one item. Never read all profile
text, bank fields, addresses, emails, scores, or notification settings.

Names and student numbers always return `{placeholder, displayed}` objects with `{{FULL_NAME}}` or
`{{STUDENT_NUMBER}}`, not raw identifiers, including when Hatch setup was skipped. These indicate a nonempty
labelled field exists, not that its value was compared with the locally configured Hatch identifier. Do not
recover raw identifiers or promise that an unconfigured placeholder resolves to a value.

History fields return `{label, displayedEntries, entriesDisplayed, emptyDisplay}`. A labelled empty list is an
empty display, not proof of no history. `leaveSemesters` is the exact string next to its label, distinct from
explanatory text that may contain other numbers.

Top-level flags are `unavailableFields`, `emptyFields`, `redactedFields`, and `truncated`. An `error` means
navigation, expansion, or structure must be checked; it is not an empty student record.

## Verification status

On 2026-11-07 the General fields, both history groups, and the leave-semester count were read in the contributor's
visible browser. Only field names and structural/equality assertions were returned during development; no raw
identity, affiliation, year/class, history, or count values were recorded in the repository.
The observed history groups were labelled empty displays. Populated histories were tested with fictional DOM
only; different real list layouts need checking before claiming complete history coverage.

Synthetic checks in `../../../evals/profile-fixtures.js` cover nested shadow roots and slots, field selection,
identifier masking without Hatch mappings, banking isolation, count-versus-note separation, empty histories,
row limits, closed sections, unknown labels, and origin checks.

The manifest declares the existing `contact` permission category for profile/identifier access alongside
academic records and marks the portal as a personal origin. This does not expand the script's field allowlist.
All reads remain subject to `academic_consent` and Tomo's per-read approval.
