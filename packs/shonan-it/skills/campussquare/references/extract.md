# Extracting CampusSquare tables

Run these with `browser_console(expression=...)` on a page whose results are shown. Each returns compact JSON. Pick
only the columns the question needs before answering. Header tables (name, student number) are skipped on purpose.

## Any result table, by its header

Returns the rows of the first innermost table in `<article>` whose first row contains `HEADER` (e.g. `開講科目名`,
`科目大区分`, `基準`, `時限`). Change `HEADER` and, if needed, `LIMIT`.

```js
(() => {
  const HEADER = "科目大区分", LIMIT = 200;
  const t = s => (s || "").replace(/\s+/g, " ").trim();
  const tables = [...document.querySelectorAll("article table")].filter(x => !x.querySelector("table"));
  const tb = tables.find(x => x.rows.length && t(x.rows[0].innerText).includes(HEADER));
  if (!tb) return JSON.stringify({ error: "table not found", headers: tables.map(x => t(x.rows[0]?.innerText).slice(0, 60)) });
  const rows = [...tb.rows].map(r => [...r.cells].map(c => t(c.innerText)));
  return JSON.stringify({ columns: rows[0], rows: rows.slice(1, LIMIT + 1), total: rows.length - 1 });
})()
```

## Key–value tables (GPA, totals, judgement)

Collects `label → value` pairs from two-column tables, e.g. 累積GPA, 修得単位数, 卒業要件単位数, 判定結果,
登録可能(CAP残り). Labels for name and student number are dropped.

```js
(() => {
  const t = s => (s || "").replace(/\s+/g, " ").trim();
  const skip = /氏名|学籍番号/;
  const out = {};
  for (const r of document.querySelectorAll("article tr")) {
    const cells = [...r.cells];
    for (let i = 0; i + 1 < cells.length; i += 2) {
      const k = t(cells[i].innerText), v = t(cells[i + 1].innerText);
      if (k && v && k.length < 30 && !skip.test(k) && !cells[i].querySelector("table")) out[k] = v;
    }
  }
  const notes = (document.querySelector("article")?.innerText.match(/※[^\n]+/g) || []).map(t);
  return JSON.stringify({ values: out, notes });
})()
```

## Self-check rows that are short

On 自己判定 / 資格自己判定 results: the categories not yet met, with credits still needed.

```js
(() => {
  const t = s => (s || "").replace(/\s+/g, " ").trim();
  const tb = [...document.querySelectorAll("article table")].find(x => t(x.rows[0]?.innerText).startsWith("区分"));
  if (!tb) return JSON.stringify({ error: "no result table; press 判定 first" });
  const n = s => (/^\d+(\.\d+)?$/.test(s) ? Number(s) : null);
  const rows = [...tb.rows].slice(1).map(r => [...r.cells].map(c => t(c.innerText)));
  const short = rows.filter(r => r[5] === "×").map(([name, base, max, earned, registered]) => ({
    name, base: n(base), earned: n(earned), registered: n(registered),
    still_needed: n(base) === null ? null : Math.max(0, n(base) - (n(earned) || 0) - (n(registered) || 0)),
  }));
  return JSON.stringify({ rows: rows.length, short });
})()
```

## Timetable (履修登録・登録状況照会)

Registered slots only, plus the その他 list.

```js
(() => {
  const t = s => (s || "").replace(/\s+/g, " ").trim();
  const days = ["月", "火", "水", "木", "金"];
  const slots = [];
  for (const r of document.querySelectorAll("article tr")) {
    const first = r.cells[0] && t(r.cells[0].innerText);
    if (!/^\d限$/.test(first || "") || r.cells.length !== 6) continue;
    [...r.cells].slice(1).forEach((c, i) => {
      const v = t(c.innerText);
      if (v && v !== "未登録") slots.push({ day: days[i], period: first, course: v });
    });
  }
  const other = [...document.querySelectorAll("article table")].find(x => t(x.innerText).startsWith("その他（不定期"));
  const others = other ? [...other.rows].slice(2).map(r => [...r.cells].map(c => t(c.innerText))).filter(r => r.length > 1) : [];
  return JSON.stringify({ slots, others });
})()
```

## Attendance of every course (授業情報)

Run on 授業情報 (`JPW0001000-flow`). Reads each course's detail page in the background (same session, read-only)
and returns per course how many classes were attended (`○`), missed (`欠`) and marked `他` (late / special), plus
cancellations / make-up notices. One call instead of opening every course. `browser_console` awaits the promise.

```js
(async () => {
  const t = s => (s || "").replace(/\s+/g, " ").trim();
  const links = [...document.querySelectorAll("article a")].filter(a => /出欠情報/.test(a.innerText));
  const out = [];
  for (const a of links) {
    const course = t(a.closest("tr")?.cells[1]?.innerText).replace(/【[^】]*】/g, "");
    const d = new DOMParser().parseFromString(await (await fetch(a.href, { credentials: "include" })).text(), "text/html");
    const art = d.querySelector("article");
    if (!art) { out.push({ course, error: "no detail (signed out?)" }); continue; }
    const marks = [...art.querySelectorAll("td")].map(td => t(td.textContent)).filter(v => ["○", "欠", "他"].includes(v));
    const rest = art.cloneNode(true); rest.querySelectorAll("table").forEach(x => x.remove());
    // the 教室変更 / 休講 / 補講 block without its headings and "none" lines: empty when nothing changed
    const notices = t(t(rest.textContent).replace("休講補講スケジュール", "").replace(/(教室変更|休講|補講)情報はありません。/g, "")
      .replace(/出欠情報/g, "").replace(/(^|\s)(教室変更|休講|補講)(?=\s|$)/g, " "));
    const n = m => marks.filter(x => x === m).length;
    out.push({ course, present: n("○"), absent: n("欠"), late_or_other: n("他"), notices });
  }
  return JSON.stringify(out);
})()
```

`absent` of 3 or more: warn (5 absences = `Y`, failed; no exception). `late_or_other` stays separate: how it counts is
the instructor's rule (syllabus). Empty cells are not counted: classes not held yet.

