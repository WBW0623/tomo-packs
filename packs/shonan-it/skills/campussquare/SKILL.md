---
name: campussquare
description: Read the student's CampusSquare courses, grades and credits.
version: 0.1.0
author: TK (TkYu), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [shonan-it, campussquare, portal, grades, credits, timetable]
    related_skills: []
  tomo:
    title: { en: "CampusSquare (read-only)", zh: "CampusSquare（只读）", ja: "CampusSquare（閲覧のみ）" }
    summary:
      en: "Reads your timetable, grades, credits and self-check in a browser window you can see. You sign in yourself."
      zh: "在你看得见的浏览器窗口里读取课表、成绩、学分和自己判定。登录由你自己完成。"
      ja: "見えるブラウザで時間割・成績・単位・自己判定を読み取ります。ログインはご自身で行います。"
---

# CampusSquare (Shonan Institute of Technology portal)

Reads the student's own records from CampusSquare (`https://portal.shonan-it.ac.jp/campusweb/`) in Tomo's visible
browser window: today's classes, registered courses, the school calendar, grades, credits and GPA, the graduation
self-check (自己判定) and the licence/programme self-check (資格自己判定). CampusSquare has no API, so this skill only
uses the `browser_*` tools. It is **read-only**: it never registers or cancels courses, never changes settings and
never types a password.

## When to Use

- "What classes do I have today / this term?", "Is there a cancelled class?", "Did I miss attendance?"
- "How many credits do I still need?", "Can I graduate?", "Which category am I short in?"
- "What is my GPA?", "What grade did I get in X?", "How much CAP is left?"
- Course recommendations that must respect the student's timetable, CAP and missing categories.
- "Can I still get the teaching licence / AI course certificate?"

Don't use for: course content or syllabus questions (use the syllabus search), school rules in general (term
guidance), or anything when the student said Tomo may not read grades (see `USER.md`: grades consent "never") —
then explain where the page is and let the student look.

## Rules

1. **The student signs in, never you.** You do not know and never type the password; Tomo has none. When a page shows
   the sign-in form (`ユーザー名` / `パスワード`, button `ログイン`), stop, tell the student to sign in in the browser
   window (user name = student number with an upper-case letter), and continue only after they say they are done.
2. **Only while the student watches.** Before opening a page, say which page you open and what you will read. Read
   grades, GPA and credit pages only in the conversation where the student asked for them.
3. **Read-only.** Allowed actions: open a page by URL, change the display filters (year, term, range), press
   `画面に表示する` or `判定` (they only compute and display). Never press `履修登録`/`取消`, the
   `指定された時間割の履修登録はこちらから` link, `設定保存`, calendar date cells (they add Myスケジュール entries),
   `ファイルに出力する` or `テキスト出力` (downloads).
4. **Minimal data.** Extract only the columns the question needs (`references/extract.md`). Name and student number
   on every page arrive as `{{FULL_NAME}}` / `{{STUDENT_NUMBER}}`; never try to recover them. Grades, GPA and
   self-check results are personal data: Tomo asks the student before each item is sent; if refused, answer without it.
5. **Sign out when done** with `browser_navigate` to `https://portal.shonan-it.ac.jp/campusweb/portal.do?page=logout`
   unless the student says they will keep using it. The page then shows `ログアウトしました。`

## Procedure

1. **Open the page directly.** Every menu item has a stable URL; open it with `browser_navigate` instead of clicking
   the menu (the side menu has hidden duplicate links). URLs and page layouts: `references/pages.md`.
   Done when the page title matches the page you wanted, or the sign-in form is shown (→ Rule 1, then reopen).
2. **Set filters only if needed.** Grades and credits pages start with a filter form: keep `過去を含めた全成績`
   for history, or choose `対象年度・学期の成績のみ` + year + term. Press `画面に表示する`. Self-check: pick the
   year (default is the student's year) and press `判定`.
   Done when the result tables are present.
3. **Extract with `browser_console`** using the expressions in `references/extract.md` (compact JSON, one row per
   course or category). Use `browser_snapshot` only to find a control, not to read long tables.
   Done when you have the rows the question needs and the page's "as of" note (e.g. `※2026年度前学期終了時点の結果です。`).
4. **Answer with the source.** Name the page, term and "as of" date; quote numbers exactly as shown. For graduation
   questions, go through every category of the self-check (see Interpretation), not only the total.
   Done when every number in the answer comes from a page you read in this conversation.
5. **Sign out** (Rule 5).

## Interpretation

- **Graduation needs every category, not just the total.** In 自己判定 each `■` row is a category with its own
  minimum (`基準単位数`); indented rows are its sub-requirements. A student fails graduation if any `■` category is
  short, even with ≥ 124 credits in total. Example: `■学科専門科目（必修・選必・選択）` needs 80. Report the
  categories marked `×` and how many credits each still needs (基準 − 修得 − 履修).
- `修得単位数` = earned; `履修単位数` = registered this term, not yet graded; `合格見込み` `〇` = met if the registered
  courses are passed, `×` = still short. `上限単位数` `-` = no upper limit; only credits up to the limit count.
- The self-check header shows `判定グループ` with the 専攻 (情報学部): use it to confirm the student's major.
- The header `卒業要件単位数` and the `□卒業要件単位` row can show different numbers; quote both, do not explain the gap.
- Grades: `評価` is the score (0–100) or `N` for transferred / recognised credit (`評語` `認`); `評語` S/A/B/C; `合否`
  `合` passed. Leave `N` rows out of score averages.
- `直前学期GPA`, `累積GPA`, `年度GPA`, `学期GPA` are the school's own numbers; never recompute GPA.
- `登録可能(CAP残り)`: credits that may still be registered this term; recommendations must fit in it. Credits outside
  graduation requirements are not counted there.
- **卒業研究Ａ/Ｂ** (4th year) is required, has no fixed day or period (`その他` / `他`) and often no attendance data.
  Ignore it when looking for free periods, clashes or recommendations; shorten its long instructor list in answers.
- `その他（不定期授業、集中授業、特別履修授業など）` courses take no timetable slot.
- Attendance (`出欠情報`) and cancellations (`休講補講`) are icons per course in 授業情報; `なし` in the icon text means
  no record.

## Pitfalls

- The session ends after about 30 minutes without activity (`残り…分` in the header). If a page suddenly shows the
  sign-in form, follow Rule 1 and reopen the page; do not retry in a loop.
- URLs contain `_flowExecutionKey`, which expires; always start from the `_flowId` URL, never reuse an old key.
- Registration and cancellation only work in the registration period (`期限` shows `登録・取消期間外` otherwise).
  Even in the period, tell the student which `時間割コード` to enter and where; they press the buttons.
- The calendar (スケジュール管理) mixes school events with timetable slots; course slots only appear for courses with a
  fixed day and period.
- Page texts use full-width letters and digits (`Ｓ`, `１Ａ`); normalise before comparing with syllabus data.

## Verification

- The answer names the page and the "as of" note, and every number matches the page.
- No action other than those allowed in Rule 3 was taken (check the tool calls).
- The session was signed out, or the student said they continue.
