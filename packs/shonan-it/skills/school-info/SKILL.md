---
name: school-info
description: Find school information (calendar, holidays, exams, procedures, notices) on the official Shonan Institute of Technology website.
version: 0.1.0
author: TK (TkYu), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [shonan-it, school-website, calendar, holidays, procedures, notices]
    related_skills: [campussquare]
  tomo:
    title: { en: "School website search", zh: "学校官网检索", ja: "大学公式サイト検索" }
    summary:
      en: "Searches the school's official website (in Japanese) for the academic calendar, holidays, procedures and notices, and reads the PDFs it publishes."
      zh: "用日语检索学校官网，查找学年暦、假期、手续和通知，并读取官网发布的 PDF。"
      ja: "大学公式サイトを日本語で検索し、学年暦・休業期間・各種手続き・お知らせを調べ、公開 PDF を読み取ります。"
---

# School website search (www.shonan-it.ac.jp)

Answers general questions about Shonan Institute of Technology from its official website: the academic calendar
(学年暦: term dates, holidays, exam periods, course registration), procedures (証明書, 学籍変更, 奨学金, 授業料),
support for international students (在留管理, 在籍確認), cancelled classes, guidance materials and notices. The site is
**Japanese only**, so you always search and read in Japanese and answer in the student's language.

## When to Use

- "When is the summer break this year?", "When do classes start?", "When is course registration?"
- "When are the final exams?", "Is there class on a national holiday?"
- "How do I get a certificate / change my address / apply for a scholarship?"
- "What do international students have to report?", "Where is the student counselling room?"

Don't use for: the student's own timetable, grades or credits (use `campussquare`); course content (syllabus search);
visa or city procedures beyond what the school publishes (government sources only).

## Rules

1. **Search in Japanese, on the school's site only.** Turn the question into the school's own Japanese terms
   (table below) and call `web_search` with `site:shonan-it.ac.jp`, e.g. `学年暦 夏季休業 site:shonan-it.ac.jp`.
   Never search in Chinese or English for school facts.
2. **No questions before you look.** Pages and files on `shonan-it.ac.jp` are trusted: open and download them
   without asking. Only a file on another site may get one short question first (what it is, why you need it); do
   not ask more than once per chat. Students are not IT experts; extra questions put them off.
3. **The current academic year.** The year runs April–March: in January–March, "this year" means the year that
   started last April. Japanese era: 令和 = Western year − 2018 (2026 = 令和8年度, written `R8`). Prefer the file for
   that year; if only another year's file exists, say so plainly.
4. **Undergraduate or graduate.** Many pages have one file for 学部 (工学部・情報学部) and one for 大学院. Use the
   student's faculty from memory (`USER.md`: "Faculty: Graduate School of Engineering" = 大学院; you never see the
   student number itself). If it is not there, use the 学部 file and mention that the graduate school has its own.
5. **Never invent dates.** Every date, deadline or place in the answer comes from a page or file you read in this
   conversation. PDF tables come out flattened (see Reading PDFs): check the month before you state a date.

## Procedure

Folders (terminal): Tomo sets `TOMO_DOWNLOADS` (scratch) and `TOMO_DOCUMENTS` (Documents/Tomo). Older Tomo versions
do not, so every command below starts with the same two lines, which fall back to a temporary folder and
`~/Documents/Tomo`:

```bash
DL="${TOMO_DOWNLOADS:-${TMPDIR:-${TEMP:-/tmp}}/tomo-downloads}"
KEEP="${TOMO_DOCUMENTS:-$HOME/Documents/Tomo}/shonan-it"
```

1. **Look in the kept documents first.** `ls "$KEEP" 2>/dev/null` (with the two lines above). If a kept file fits
   the question and the current year, read it (step 4) and skip the search.
2. **Search.** `web_search` with the Japanese terms and `site:shonan-it.ac.jp`. If the results miss, try the other
   terms in the table, then open the entry pages in `references/pages.md` directly (also when search fails, is
   rate-limited or is not available).
   Done when you have the official page (or PDF link) that answers the question.
3. **Read the page.** `web_extract` the page URL. Many answers are on the page itself; calendars, guidance and
   forms are PDFs linked from it (`/media/….pdf`).
4. **Read a PDF.** Download it into Tomo's download folder with the terminal, then read it with `read_file`:

   ```bash
   DL="${TOMO_DOWNLOADS:-${TMPDIR:-${TEMP:-/tmp}}/tomo-downloads}"
   mkdir -p "$DL" && curl -fsSL --max-time 60 -o "$DL/schedule2026_AB.pdf" "https://www.shonan-it.ac.jp/media/schedule2026_AB.pdf" && echo "$DL/schedule2026_AB.pdf"
   ```

   Use the file name from the URL; `read_file` the printed path. If `read_file` reports scanned pages without text
   (`NEEDS OCR`), say the file has no text, give its link and stop.
5. **Answer with the source.** Short answer first, in the student's language, then the source: document or page
   title (Japanese, with a translation), year (e.g. 令和8（2026）年度), URL. Keep Japanese terms the student will
   meet at school in Japanese with a translation, e.g. 夏季休業期間 (summer break).
6. **Offer to keep the PDF, once.** After answering from a PDF that is not kept yet, ask with `clarify` and two
   choices whether to keep it for next time, e.g. `この PDF「R8学年暦（学部）」を「書類/Tomo」に保存して、次回すぐ使えるようにしますか？`
   in the student's language (choices like "Keep it" / "No thanks"). If yes:

   ```bash
   DL="${TOMO_DOWNLOADS:-${TMPDIR:-${TEMP:-/tmp}}/tomo-downloads}"
   KEEP="${TOMO_DOCUMENTS:-$HOME/Documents/Tomo}/shonan-it"
   mkdir -p "$KEEP" && cp "$DL/schedule2026_AB.pdf" "$KEEP/R8学年暦_学部.pdf" && echo "$KEEP/R8学年暦_学部.pdf"
   ```

   Name it `<year>_<Japanese title>.pdf`-style so the student recognises it, and say where it is ("Documents › Tomo ›
   shonan-it"). Do not ask again in this chat for the same file, and never ask for HTML pages.

## Japanese terms

| The student asks about | Search for |
|---|---|
| school calendar, term dates, when classes start/end | 学年暦, 授業開始, 授業期間 |
| summer / winter / spring break | 夏季休業期間, 冬季休業期間, 春季休業期間 (all in 学年暦) |
| exams | 定期試験, 期末試験, 追試験 |
| course registration | 履修登録期間, 履修訂正期間, 履修登録について |
| cancelled classes, make-up classes | 休講情報, 補講, 時間割変更 |
| health check | 健康診断 |
| guidance, rules of study | 学年ガイダンス, 履修要項 |
| tuition, scholarships | 授業料, 学費, 奨学金, 日本学生支援機構 |
| certificates, address change, student card | 証明書発行, 学籍の変更, 住所変更, 学生証 |
| international students | 留学生支援, 在留管理制度, 在籍確認, 所属機関に関する届出 |
| counselling, health, harassment | 学生相談室, 健康管理, ハラスメント相談 |
| library | 附属図書館, 開館時間 |
| jobs, careers | キャリア支援, 就職, アルバイト紹介 |

## Reading PDFs

`read_file` turns the calendar's tables into text rows such as
`２日（火）～３月３１日（水）|春季休業期間` or `６日（木）～９月２３日（水）||夏季休業期間`: the month of the first
day is often in another column or row. Work out the month from the calendar grid rows around it (each block is one
month) and from the term (前学期 April–September, 後学期 October–March); when it stays unclear, give the range as
printed with the document name so the student can check. Holidays that are teaching days are listed separately
(`青字は通常授業の実施日`, `授業分の振替休日`): mention them when the question is about a specific day.

## Verification

- Every date in the answer appears in the page or PDF text you read in this conversation.
- The source line names the document, its year and the URL on `shonan-it.ac.jp`.
- You asked at most one question about keeping a PDF, and none before searching or downloading from the school site.
