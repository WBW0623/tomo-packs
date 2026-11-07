# Reading academic records

Read `../scripts/read-academic.js` and run its complete expression with `browser_console` after the expected
result page is displayed. Edit only its `REQUEST` object for the actual question. It reads the rendered DOM,
returns JSON, and does not navigate, submit, fetch, print, or write files.
For My Page student-profile or leave/study-abroad information, use [profile.md](profile.md) and
`../scripts/read-profile.js`; the academic expression below does not run on the portal origin.

## Request choices

| Question | `kind` | Minimal `fields` | Filters |
|---|---|---|---|
| Registered courses and recurring schedule | `timetable` | `course`, `term`, `dayPeriod` | Exact displayed `course` / `term`, or Japanese `day` (`月` through `土`) only when needed |
| Registered-course detail | `course-detail` | Requested subset of `course`, `instructor`, `credits`, `term`, `dayPeriod`, `format`, `registration`, `offering`, `status`, `field` | Exact `course` required; open its information dialog first |
| Course location | `timetable` | `course`, `dayPeriod`, `room` | Exact course; a missing room is unavailable, not an empty classroom |
| Course grade | `grades` | `course`, `grade`, `credits`, `year`, `term` | Exact displayed course, plus year/term if the student requested them |
| Complete course-grade row | `grades` | `course`, `instructor`, `grade`, `credits`, `makeupExam`, `year`, `term`, `yearLevel` | Same filters; an empty makeup-exam cell stays empty |
| Displayed GPA | `gpa` | Not used | Set `gpaScope` to `semester`, `cumulative`, or `null` for both; does not extract course records |
| Credit categories | `credits` | `field`, `earned`, `expected`, `total` | No course/year/term filters; use the period stated by the page |
| Displayed academic determination | `report` | `determination`, optionally `reportTitle` | Reads the exact `Determination` cell; does not calculate a judgement |
| Category totals in the grade report | `report` | `categoryCredits`, optionally `reportTitle` | Reads each category's displayed `Total Credits`; does not sum course credits |
| Report period or notice | `report` | `reportTitle` and/or `notice` | Only the explicitly requested sections |

Set unused `course`, `year`, `term`, `day`, and `gpaScope` to `null`. Default `limit` is 100, maximum 500; avoid requesting hundreds
of rows for a single-course question. Do not infer the displayed language's semester label. Use actual table
headings and filters rather than changing the student's saved preferences.

For "today", first select the correct semester and inspect the recurring day/period entries. Do not use the
weekday alone to claim the class will take place: check current calendar exceptions and cancellation notices.
The script deliberately does not guess clock times, classrooms, holiday exceptions, or cancellation status.
For course detail, open `科目一覧`, find the exact card by `.sbjtnm`, and press its information button
(`button[data-toggle="modal"]`). This only displays information. The expression accepts one `.modal.show`,
matches its `科目名` against `REQUEST.course`, and reads only requested labelled rows. Closed/stale dialogs
are rejected. Empty registration status stays empty; missing classrooms are not inferred.
For attendance, follow [attendance.md](attendance.md); course details do not contain attendance records.

## Table selection and privacy

- The expression only accepts `https://gacad.keio.jp` and the verified academic result paths.
- Registered courses are cards under `#course_regist-tab_sbjt .reg-list > .reg-list-item`. Course names,
  instructors, credits, and day/period use `.sbjtnm`, `.lctnm`, `.credit`, `.daypd`; semester is a separate
  displayed span. This is distinct from the hidden course-detail modal, whose rows are field labels and values.
  Expand `科目一覧` before reading the list. Additional fields are returned only when their explicit label is present.
- Grades and credit summaries use exact result-table headers. The script excludes identity-header tables,
  does not return arbitrary page tables, and does not expose their contents on failure.
- Only the requested allowlisted fields are returned. Identity headers and unrelated profile tables are not
  valid result tables; requesting arbitrary fields is rejected.
- GPA extraction accepts an exact GPA label with a numeric adjacent value or a numeric value under a header
  row consisting only of GPA labels. The verified English report uses inline `SEMESTER: <number>` and
  `CUMULATIVE: <number>` cells inside `table.GPA`; these have distinct `semester` and `cumulative` scopes.
  A blank cell beside the generic `GPA` heading must not mask these explicit values.
  Blank/non-numeric displays produce `available: false` and a reason, never
  a fabricated numeric value. A different layout returns an error instead of scraping nearby identity information.
- No data is saved. Let Tomo perform its normal per-read consent flow; do not copy results to files or memory.

## Handling output

An `error` is a failed read, not an empty academic result. `unavailableFields` means those fields could not be
read. `irregularRows` means some table rows did not have the expected shape and need checking before a complete
answer. `truncated` means the returned rows do not cover the whole matching result.
Grade-report category rows with the verified merged-cell shapes and the full-width footer are counted as
`sectionRows` and excluded from course records. Other malformed rows still count as `irregularRows`.
The same category rows are available separately through `kind: "report"`, `fields: ["categoryCredits"]`.
Each has `category`, `label`, `totalCredits` (exact numeric string when recognized), and `displayedSummary`.
An unrecognized numeric summary has `totalCredits: null`; preserve the display and do not invent a number.
Report results use a `values` object keyed only by requested fields. `determination` has the exact label and
value, while `notice` is an array of displayed notice cells. These queries never return identity headers.

`available: false` for GPA or the credit summary is not a zero value. A credit header without category rows yields
`no_category_rows_displayed`. A weekday-filtered timetable reports `unscheduledCoursesNotMatchedToDay` for
courses marked `その他` or otherwise unscheduled; mention these separately instead of treating them as free slots.

An empty `rows` array with an exact course/year/term filter does not prove that a course was never taken; check
the filter and report the actual scope. Preserve separate course attempts rather than keeping only the latest
one without an applicable rule. Report the site's GPA value and label without converting grades to points.

## Validation status

Verified in the contributor's visible, signed-in browser on 2026-11-07, with only schema/count/assertion results
returned during development:

- Registered-course card extraction, including semester and day/period fields, executed successfully.
- All ten labelled registered-course detail rows were read in the displayed information dialog; blank
  registration status was preserved rather than interpreted.
- The English grade report's course, grade, credit, year, and semester columns executed successfully; category
  rows and the footer were excluded without treating them as missing course rows.
- All eight course columns were subsequently checked: `Subject`, `Lecturer`, `Grade`, `Credit`, `Makeup Exam`,
  `Year`, `Semester`, `Year Level`. The displayed `Determination`, report title, category `Total Credits`, and
  `Notice` were also extracted and structurally checked against the rendered page, without recording their values.
- Numerical semester and cumulative GPA were read from `table.GPA` and checked against their displayed fields.
  The initial parser missed these inline labels; it was corrected and verified in the same signed-in session.
  The generic `GPA` row has a blank adjacent cell, so that row must not be used as the sole GPA source.
- The credit-summary header had no data rows; the script correctly returned unavailable. Populated summaries
  on a real account remain unverified; merged/hierarchical variants may require adapting the column mapping.
- Synthetic checks in `../../../evals/extraction-fixtures.js` cover identity exclusion, course/year/term/weekday
  filters, row limits, unexpected origins, duplicate tables, missing classrooms, GPA, and earned/expected credits.

During developer verification, execute the extraction in the browser and return only structural assertions:
the query kind, field names, count, completeness flags, whether identity tables were excluded, and whether the
GPA availability/value matches the displayed field. Keep the actual records inside the browser and do not paste them into the
repository or tool logs. A successful schema/count check does not establish support for other faculties or years.
