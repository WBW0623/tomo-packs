# CampusSquare pages

Base: `https://portal.shonan-it.ac.jp/campusweb/`. Open pages by `_flowId`; the server redirects to a URL with a
fresh `_flowExecutionKey`. Every page starts with a header table: 学生氏名, 学籍番号, 学生所属 (faculty and department,
no 専攻), 学年. Content is inside `<article>`. Layout recorded 2026-11 (2026 後学期) with a 4th-year and a 3rd-year
account (情報学部); notes marked "3rd year" are what a lower-year account shows differently.

| Menu | Page | URL (relative to base) |
|---|---|---|
| ポータル | 授業情報 | `campussquare.do?_flowId=JPW0001000-flow` |
| ポータル | スケジュール管理 | `campussquare.do?_flowId=PTW0001200-flow` |
| ポータル | 履修登録・登録状況照会 | `campussquare.do?_flowId=RSW0001000-flow` |
| ポータル | 学生情報 | `campussquare.do?_flowId=CHW0001000-flow` (not used) |
| 学修状況・判定 | 履修成績照会 | `campussquare.do?_flowId=SIW0001200-flow` |
| 学修状況・判定 | 単位修得状況照会 | `campussquare.do?_flowId=SIW0001300-flow` |
| 学修状況・判定 | 自己判定 | `campussquare.do?_flowId=HTW0001000-flow` |
| 学修状況・判定 | 資格自己判定 | `campussquare.do?_flowId=HTW0001100-flow` |
| — | Sign out | `portal.do?page=logout` |

## 授業情報

- Buttons at the top: 履修登録状況, 単位修得状況, 自己判定 (shortcuts to the pages below).
- `本日の授業一覧(M/D)`: 時限, 時間割コード, 開講科目名, リンク. No classes → one cell `該当するデータはありません`.
- `履修科目一覧`: filter 年度 (text) + 学期区分 (前学期 / 後学期) + `表示`; columns 時間割コード, 開講科目名 (link to the
  course's registration detail), 曜日・時限 (`他` = no fixed slot), リンク. The リンク cell holds two icons whose
  `alt` text tells the state: `休講補講教室変更なし` / … and `出欠情報なし` / `出欠情報あり`.
- Course names carry the instructor and sometimes a class mark: `線形代数（メ）【Instructor】`, `進路研究【…他】（Ｉ）`,
  even a slot (`政治行動【…】 木１`). Strip `【…】` and trailing marks before matching with the syllabus.
- The `出欠情報` link of each course opens its **course detail** (same page, `_eventId=detailRishu&nendo=…
  &jikanwariShozokuCd=…&jikanwariCd=…` with the current `_flowExecutionKey`; take the link from the page, never build
  it). The detail has a header (年度・学期, 曜日・時限, 開講所属, 時間割コード, 開講科目名, 担当), a
  `休講補講スケジュール` block (教室変更 / 休講 / 補講; `…情報はありません。` when none) and the `出欠情報` grid: rows
  alternate between dates (`10/06（火）1限`, up to 12 per row) and marks: `○` present, `欠` absent, `他` late or a
  special case, empty = not held yet or not recorded. Button `戻る` goes back. Courses without a fixed slot (4th-year
  ゼミ, 卒業研究) show `出欠情報なし`.

## スケジュール管理

- Month view by default (`YYYY年M月`, prev / next, `週単位で表示`).
- Toggles (default on): Myスケジュール, 時間割コマ情報, 休講補講情報; `設定保存` stores them (do not press).
- Day cells: day number + event names (school events such as 松稜祭, timetable slots, cancellations). Each cell has
  a `#` link that adds a personal entry (do not press).
- Timetable slots read `1限:科目名@教室` (e.g. `2限:クラウドコンピューティング@1404講義室`, `…@A302演習室`); the course
  name is cut after about 20 characters. This is the only page that shows **classrooms**. Courses without a fixed
  slot (卒業研究, intensive courses) do not appear.

## 履修登録・登録状況照会

- Header: 年度・学期, 期限 (`登録・取消期間外` outside the period), 直前学期GPA, 登録可能(CAP残り), 登録済 (credits;
  note `※上記には卒業要件外の単位は含まない`).
- 判定結果: e.g. 卒業研究着手判定 → 合格 / … with the term; note `※YYYY年度X学期終了時点の結果です。`
  3rd year: the row is there but empty (not judged yet) and there is no note.
- `登録可能(CAP残り)` can be `0.0単位` (the term's limit is used up).
- Link `指定された時間割の履修登録はこちらから` (registration — never press).
- Term switch: 前学期 / 後学期 links (`gakkiKbnCode=1` = 前学期).
- Timetable grid: 月曜日–金曜日 × 1限–5限; empty slot `未登録`.
- `その他（不定期授業、集中授業、特別履修授業など）`: 曜日, 時限, 時間割コード, 開講科目名, 担当教員名, 単位数; when empty,
  one cell `登録されていません`.
- Footer: `最終更新日時`, `テキスト出力` (download — do not press).

## 履修成績照会

- Filter: radio `spanType` 0 = 過去を含めた全成績 (default), 1 = 対象年度・学期の成績のみ with `nendo` (year) and
  `gakkiKbnCd` (前学期 / 後学期). Buttons: `画面に表示する`, `ファイルに出力する` (do not press), `クリア`.
- Result: header (年度・学期 `指示なし` for all), then one table: No., 開講年度, 開講区分, 時間割コード, 開講科目名,
  教員名（主担当）, 評価, 評語, 合否. No credit column.
- Only graded courses are listed: this term's courses appear after grading. 開講区分 also has `前学期集中` /
  `後学期集中` (intensive). A failed course that was taken again shows twice (old row 否, new row with the new result).
- 評価 is a score or a letter: `N` (recognised, 評語 `認`), `X`, `Y`, `Z` (評語 `未`, failed; see SKILL.md).

## 単位修得状況照会

- Same filter form as 履修成績照会.
- Result: header with 修得単位数 (total); 判定結果 table (卒業研究着手判定); GPA table: 累積GPA, 年度GPA, 学期GPA;
  course table: No., 科目大区分, 科目中区分, 科目名, 単位数, 修得年度, 修得学期, 評価, 評語, 合否. Despite the page
  name, the table also lists **failed** courses (合否 `否`, 評語 `Ｄ` / `未`): count only `合` rows as earned.
- 3rd year: 判定結果 is empty and there is no "as of" note.
- 科目大区分 / 中区分 seen for 情報学部: 共通基盤科目 (基礎, 発展), 社会人基礎科目 (キャリア, 人間と社会, 外国語,
  健康とスポーツ, ICT基礎), 学科専門科目 (専門基礎, 課題解決型実習, 数理・データサイエンス, コンピュータサイエンス,
  インフォメーションサイエンス, 情報と社会).

## 自己判定

- Form: 判定学年 `hanteiNenji` (1年–4年, default = the student's current year), button `判定` (`_eventId_execute`).
- **What is judged depends on 判定学年.** 4年: graduation (`□卒業要件単位` 124, 総合判定結果 with 卒業要件単位数 and
  判定結果 `卒業` / `留年`, plus the row `卒業研究Ａ・Ｂ（必修）`). 3年: the requirement for starting graduation research
  (`□卒業研究履修要件単位`, e.g. 104, smaller category minimums, no 総合判定結果 block). Rows can differ between the two
  (e.g. 人間と社会 split into 公共系 / 国際系 / 経済系 only in the 4年 judgement).
- Result: header with 判定グループ (faculty, department and **専攻**) and 判定学年; 総合判定結果: 卒業要件単位数, 判定結果
  (e.g. 卒業 / …); 判定結果（詳細）: 区分, 基準単位数, 上限単位数, 修得単位数, 履修単位数, 合格見込み (〇 / ×).
- Row levels: `□…` = total; `■…` = category (must each be met); other rows = sub-requirements of the `■` row above.
  A third level exists: semester groups of the major (`２年前学期（専攻必修・選択必修）`) followed by their own `必修` row.
  Link `別の条件で自己判定を実行する` goes back to the form.
- 判定グループ shows the major (e.g. `情報学部情報学科 人工知能専攻`); the rows depend on major and entry year.

## 資格自己判定

- Form: 所属 `curShozokuCd` (all departments and graduate programmes; default = own), 判定学年 `hanteiNenji`
  (default **4年**, not the current year),
  資格 `hanteiShikaku` (e.g. 教育職員免許状 中学/高校教諭一種免許〔数学〕〔情報〕, 横断型先端分野学修プログラム AI /
  IoT / ロボティクス / XRメディア / 医工学コース, ICT・AI・データサイエンス教育プログラム 応用基礎レベル), button `判定`.
  Names carry the entry years they apply to, e.g. `教育職員免許状 （2024～）高校教諭一種免許〔情報〕`,
  `横断型先端分野学修プログラム ＡＩコース（23A・B～）`: pick the one for the student's entry year.
- Result: 判定所属, 判定学年, 判定資格; 判定総合結果: 修得見込み単位数, 判定結果 (〇 / ×); details with the same columns
  as 自己判定. Row levels: `★…` = total for the licence, `Ａ）…` = group, `Ａ１）…` = item.
- For licence questions, list the `×` rows with the credits still needed and point to the 教職課程 office for the
  official check.
