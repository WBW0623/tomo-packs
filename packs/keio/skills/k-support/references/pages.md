# Academic pages and controls

Observed routes from the 2026-11-07 discovery. The developer inventory at
`docs/keio/k-support-survey.md` records broader menu coverage; it is not a prerequisite for using this skill.
The academic routes below and the My Page sections in [profile.md](profile.md) are the skill's supported routes.

| Need | Page | Stable address | Display action |
|---|---|---|---|
| Registered courses / recurring timetable | `登録済科目確認` | `https://gacad.keio.jp/rishu/confirm` | `春学期`, `秋学期`, `科目一覧`; do not enter registration workflows |
| Grades / displayed GPA | `学業成績表` | `https://gacad.keio.jp/rcs/login` | `Display` shows the HTML report at `/rcs/topMenu`; `back` returns to the menu |
| Credit summary | Registered-course page | `https://gacad.keio.jp/rishu/confirm` | Read the table headed `分野コード`, `分野`, `今学期以降取得見込み`, `前学期までに取得済`, `合計` |
| Cancellation / makeup lookup | `休講・補講・任意設定講義情報` | `https://gacad.keio.jp/rishu/lecInfo` | Form structure inspected; result extraction and search trigger require verification |
| Exam timetable | `試験時間割` | `https://gexam.keio.jp/exam-tt/` | Landing inspected; no published timetable was available during discovery; result columns unverified |

Use `https://keio.jp/` to establish the student's session. Its portal landing is
`https://keiouniversity.my.site.com/students/s/`. Navigation links may open a new tab. If a stable URL does not
establish an application session, return to the portal and use its exact menu label. Do not copy session keys or
send the student to opaque authentication URLs.

## Registered-course display

There are semester timetable grids and a card-based course list. Timetable headers include `月` through `土` and
numeric periods. Open the display tab with `a[href="#course_regist-tab_sbjt"]` (`科目一覧`). Course cards are
`.reg-list > .reg-list-item`; `.sbjtnm`, `.lctnm`, `.credit`, and `.daypd` contain the course, instructor, credits,
and day/period. The semester is a separate direct child span. The hidden detail modal has the key/value labels
`科目名`, `担当者名`, `単位`, `学期`, `曜日時限`, `授業実施形態`, `登録番号`, `設置`, `登録状況`, `分野`;
these are not column headings of a course table. Prefer the verified card list for course records; classroom or
clock-time data must come from an actual displayed field or the applicable official bell schedule.
The card's information button opens its detail modal without changing registration. All ten labelled rows
were read in the browser and are supported by `kind: "course-detail"`, with an exact course-name check.

The credit table is distinct from the course cards. Preserve expected versus earned credit labels. Table
structure can vary with faculty and program; do not assume the absence of a matching table means zero credits.
The tested page contained its column headings without any category rows, so populated credit summaries remain
unverified. Courses marked `その他` have no fixed weekday/period in this display; do not assign them a slot.

## Grade report

The first menu page contains an identity table. Skip it. `Display` opens a report containing GPA and a course
table. English headers observed include `Subject`, `Grade`, `Credit`, `Year`, `Semester`, `Year Level`.
The complete eight-column header is `Subject`, `Lecturer`, `Grade`, `Credit`, `Makeup Exam`, `Year`,
`Semester`, `Year Level`; all eight were verified. Blank makeup-exam cells are preserved rather than interpreted.
Do not type or submit any field to reveal the report. Do not print or export it.
The verified `table.User.GPA` has a generic `GPA` row with a blank adjacent cell, followed by inline cells
`SEMESTER: <number>` and `CUMULATIVE: <number>`. Read the latter separately as semester and cumulative GPA.
Both numerical fields were verified against the live display. Do not stop at the empty generic row or replace
one scope with the other. A displayed zero is preserved exactly; do not treat it as a missing value.

The academic determination is in `table.User`, with a `th` exactly labelled `Determination` followed by its
value `td`. Read only that pair, not other profile information. The report title identifies the report period;
individual course rows can be from other years or semesters, so retain their own period fields too.

Category-summary rows in the course table have two cells spanning six and two columns. The first is the
category label and the second displays `Total Credits <number>`. These summaries are distinct from individual
course records and from the registered-course page's earned/expected credit table. A full-width `[EOR]` row
ends the table. `table.User.message` has a `Notice` heading and the report's notice text. These sections were
verified on the real page and are available through `kind: "report"` with only the requested fields.

Official workflow: [Online grade report guide](https://www.students.keio.ac.jp/en/com/class/grade/manual.html).
If results are unavailable, use [grade-report announcements](https://www.students.keio.ac.jp/en/com/class/grade/index.html)
for the relevant announcement rather than inferring the student's academic status.

## Cancellation and exam limitations

Cancellation search has `履修中科目` / `検索条件指定`, campus `AREACD`, faculty `FACULTY_FILTER`, course name,
instructor, and start/end date inputs. Their existence alone does not verify a search or establish no changes.
Do not answer "no cancellations" without reading a valid result for the requested course/date.

An empty/unpublished exam timetable does not mean the student has no exams. The official page distinguishes
published final/makeup exam schedules from course assessments announced by the instructor.

## Logout

For the HTML grade report, use `back`, then `Logout` on the menu. Registered-course and exam pages have
`ログアウト` controls. Their completed logout states still need per-application verification during extraction
testing; do not claim portal logout covers them automatically.

On K-Support, `Logout` opens `ログアウトしますか？`; select `はい` to sign out (`いいえ` cancels). In discovery,
this redirected to `https://portal.keio.jp/koid/systemLogout` and displayed a successful application-logout
message. That message does not prove all SSO sessions have ended.
