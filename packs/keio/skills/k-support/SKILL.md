---
name: k-support
description: Read a Keio University student's academic profile, leave/study-abroad information, courses, timetable, grades, GPA, displayed Determination and credit summaries through K-Support.
version: 0.1.0
license: MIT
platforms: [linux, macos, windows]
metadata:
  tomo:
    title:
      en: "K-Support: student records and grades"
      zh: "K-Support：学籍、课表与成绩"
      ja: "K-Support：学籍・時間割・成績"
    summary:
      en: "Reads student academic profile, leave/study-abroad information, courses, timetable, grades, GPA and credits in the visible browser. You sign in yourself."
      zh: "在可见浏览器中读取学籍、休学／留学信息、课程、课表、成绩、GPA 和学分；登录由你自行完成。"
      ja: "見えるブラウザで学籍・休学留学情報・履修科目・時間割・成績・GPA・単位を読み取ります。ログインはご自身で行います。"
---

# K-Support academic records

Use K-Support as the entry to Keio's academic systems. Read student academic profile and leave/study-abroad
information, actual course schedules, grades, displayed GPA, and credit summaries.
Read [references/pages.md](references/pages.md) for routes and display controls, then
[references/extract.md](references/extract.md) for the extraction matching the student's question.
For student profile or leave/study-abroad questions, use [references/profile.md](references/profile.md) and
`scripts/read-profile.js` instead of the academic-table expression.
For per-course attendance questions, use [references/attendance.md](references/attendance.md). A read-only
attendance-record schema has not yet been verified; this is source discovery, not a promise of absence counts.
An official-website research skill is planned for a later version. This version reads displayed records;
it does not independently assess graduation or progression eligibility.

## When to Use

- "What classes do I have today / on Tuesday / this term? Where is my class?"
- "Which courses have I registered for? How many credits am I taking?"
- "What grade did I receive in this course? What is my GPA?"
- "How many credits have I earned, and how many are still expected?"
- "What does the grade report show under Determination? What are the category Total Credits?"
- "What program, faculty/graduate school, department, year, and class does My Page show?"
- "What leave/study-abroad history is displayed? What is my current leave-semester count?"
- "What are the registered course's format, registration number, offering, or registration status?"
- "Where can I view this course's existing attendance record?" (source discovery; do not perform check-in).

Do not use this skill to submit coursework, register or cancel courses, change personal information, make
payments, or read health or banking records. K-LMS coursework, attendance records, and graduation eligibility
are not established by a registered-course list or grade report. Do not claim those capabilities without
checking a suitable source and workflow.

## Rules

1. **The student signs in.** Open `https://keio.jp/` in Tomo's visible browser. If authentication is required,
   stop and ask the student to sign in there, including any MFA steps. Continue after they confirm. Never type
   credentials, inspect cookies or tokens, or reuse authentication/session URLs.
2. **Read while the student is present.** Say which academic page and fields you will read. Use only the
   browser tools for authenticated records; do not download or copy reports into local files, logs, memory,
   the repository, or another service.
3. **Tomo handles consent.** Supported record origins must be declared as `personal_origins` in `pack.yaml`.
   Snapshots show headings and controls; use `browser_console` for the necessary values. Tomo asks the student
   before sending them to the model. Do not add a second permission question. If consent is refused, stop
   reading and explain the page's location without asking again or trying another route.
4. **Read the minimum.** Skip identity-header tables, names, student numbers, and unrelated records. For GPA,
   read the displayed GPA alone; for a course question, restrict rows and columns to that course. Never use a
   whole-page text dump or generic two-column-table scraper. Do not recover identifier placeholders.
   My Page's name/student-number fields are available only as placeholder objects through `read-profile.js`;
   their raw values must not be sent to the model or compared against stored Hatch values by inference.
5. **Only display actions.** Opening verified pages and grade-report `Display` / `back` are permitted.
   Expanding the requested My Page General/history/count accordions is also permitted as described in `profile.md`.
   A registered course's information button may open its read-only detail dialog. Opening a Canvas course home
   or existing student grade view is permitted; clicking an attendance quiz/check-in or starting an attempt is not.
   Do not press registration/cancellation, application `申請`, inquiry `登録`, `Upload File`, evaluation
   `次へ`, `保存 Save`, `変更を保存する`, payment, print, download, or export controls. Do not assume a
   button is safe because it resembles a search or navigation control; use the per-page instructions.
6. **Keep evidence and uncertainty visible.** Cite the page label, safe stable URL, and displayed year/term
   when available. Never cite a session-bearing URL. Say when a table, GPA, classroom, date, or requirement
   is unavailable; do not substitute an estimate or a different school's rule.
7. **Sign out when done**, unless the student says they will continue using the browser. Sign out from
   opened academic applications and K-Support using their own logout controls. Portal logout alone is not
   evidence that all linked applications or the SSO session ended. Follow [pages.md](references/pages.md).

## Procedure

1. **Choose the narrow source.** For courses and timetable, use `登録済科目確認`; for grades or GPA, use
   `学業成績表`; for earned/expected credits, choose the matching academic summary. Use the requested
   term; if the student asks "today", establish the current date in Japan and the displayed semester.
   Done when the page and requested period are identified.
   For academic profile, year/class, leave/study-abroad history, or leave-semester count, use `My Page` and the
   procedure in [profile.md](references/profile.md); no grade report is needed.
2. **Open and authenticate.** Navigate through the K-Support entry or a verified stable route. Follow Rule 1
   on a sign-in page. A new tab or different origin is normal. Done when the expected page and display
   controls appear, not merely when navigation finishes.
3. **Show the result.** On the grade menu, press `Display`; on registered courses, choose the relevant
   semester/list display. Do not change registration. Done when the expected course cards, result table, or GPA area is
   present, or the site explicitly states the result is unavailable.
4. **Extract the requested fields.** Use the matching expression in [extract.md](references/extract.md).
   Treat a missing header, unexpected schema, truncated result, or consent refusal as an unresolved read;
   inspect structure only and adapt before answering. Done when the needed rows/values were read with
   consent, or the reason they cannot be read is clear.
5. **Answer from the result.** Give the requested schedule, grades, GPA, or credit summary in the student's
   language, followed by the source and period. Distinguish earned, registered, and expected credits. For
   "today", distinguish the recurring timetable from actual class occurrence; check school-calendar and
   cancellation information when necessary and do not claim those checks were made if they were not.
   Done when every personal number and course detail is traceable to the current read.
6. **Close the session.** Follow Rule 7. Done when logout is confirmed for the services used, or the student
   explicitly says they will continue; disclose any service whose logout could not be verified.

## Interpretation

- `前学期までに取得済` means earned through the preceding semester; `今学期以降取得見込み` is expected,
  not already earned. `合計` must retain the page's meaning instead of being described as earned credits.
- A registered timetable shows recurring course slots. It does not by itself establish that a class takes
  place on a holiday or that a cancellation/makeup notice is absent.
- Registered-course detail fields do not establish attendance. Canvas course lists may include communities,
  unpublished courses, and past enrollments; keep them distinct from official registration. Missing attendance
  entries, ungraded assessments, or quiz-submission states must not be converted into absence totals.
- Preserve course identifiers, offering organization, semester, and registration status where needed to
  distinguish similarly named courses. Do not merge attempts or sections merely by course name.
- Report GPA exactly as displayed, with its displayed scope. Do not recompute it, infer a missing GPA, or
  import grade-point conversions, retake rules, attendance thresholds, or graduation requirements from
  the reference pack. A visible `GPA` label alone does not establish whether it is cumulative or term GPA.
- On the verified English report, `SEMESTER:` is semester GPA and `CUMULATIVE:` is cumulative GPA. These
  inline values appear in `table.GPA`; an empty cell next to the generic `GPA` heading does not mean the
  values are absent. Keep the scopes separate. An ongoing semester's displayed value is not the cumulative
  result and does not by itself establish a final academic outcome.
- A grade/credit table is not a graduation ruling. Answer eligibility questions only after finding the
  applicable faculty/program/entry-year rules. Such rule research and independent eligibility assessment
  are outside this version; explain that limitation. Never set a university-wide required-credit default.
- `Determination` is a displayed result, read from its exact labelled cell. Return its wording and the report
  period without inventing an equivalent graduation or progression decision. Its meaning depends on the
  applicable program and rules. Read a judgement already displayed by the school separately from calculating one.
- Course `Credit` and category `Total Credits` are separate fields. Read category summaries using the report
  query, not by adding every displayed course's credits. Preserve the school's labels rather than assuming
  every registered or attempted course's credits have been earned.

## Pitfalls

- Academic records are on `gacad.keio.jp`, not solely on the K-Support origin. The portal and linked systems
  can have separate login, language, and logout states.
- Menus contain hidden duplicates; prefer verified routes or visible controls. Many menu hrefs are
  `javascript:void(0);`, and their real destinations open in new tabs.
- Lightning components can have nested open shadow roots. Document-level queries can miss real controls.
  Hidden forms/dialogs do not establish that a workflow is open or that a record exists.
- Identity information appears before the grade results. Match the result table by its column labels;
  never extract every table and then remove identity fields afterwards.
- Different faculties, cohorts, and page languages may expose different columns. An unsupported variant
  requires checking structure; it does not justify reporting an empty list as "no courses" or "no grades".

## Verification

- The requested period and source page are identified; unavailable information is stated explicitly.
- Only the requested personal rows/columns were sent through Tomo's consent flow; identity headers were skipped.
- GPA and credits retain the site's labels and scope; no academic rule or total was invented.
- No registration, application, submission, settings change, payment, download, or export occurred.
- Logout was confirmed or the student chose to keep using the session.
