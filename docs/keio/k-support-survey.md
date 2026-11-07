# K-Support discovery notes

Developer reference for the planned `keio` pack and `k-support` skill.
Observed on 2026-11-07 through the contributor's signed-in, visible Edge browser.
This is a feature and page-structure inventory, not an installable skill or a claim of full support.

## Evidence and scope

- **Observed** means a page or control was inspected in this browser session.
- **Landing only** means the application was opened, but its workflows were not investigated.
- **Menu only** means the navigation label was observed without opening the service.
- **Unverified** means that a destination, detail view, or behavior still needs checking.
- Observations concern one account's available interface. They do not establish availability for every faculty,
  year, student status, or academic term. No account affiliation or other personal values are recorded here.
- No forms were completed, applications started, payments initiated, files uploaded, or exports requested.
  The application accordions were expanded to read their instructions; their separate `申請` buttons were not pressed.
- No screenshots, raw page dumps, grade reports, timetable contents, account identifiers, credentials, or session
  URLs are included. Paths below omit query parameters, session suffixes, and individual record identifiers.

## Entry, navigation, and browser behavior

| Entry | Address or behavior | Evidence |
|---|---|---|
| Sign-in | `https://keio.jp/` | Contributor signed in independently; sign-in form was not inspected |
| Portal home | `https://keiouniversity.my.site.com/students/s/` | Observed |
| Language | `JP→EN` control | Observed; language switching not tested |
| Profile | `My Page` opens `/students/s/MyPage` | Observed |
| Sign-out | `Logout`, confirmation `ログアウトしますか？`, `はい` / `いいえ` | Verified at the end of discovery; redirects to `https://portal.keio.jp/koid/systemLogout` and displays a successful application-logout message |
| Help | `K-Supportの使い方` opens `/students/s/article/ksupport` | Observed, including official help text |

The desktop and mobile menus contain duplicate entries. Many links have `href="javascript:void(0);"` and use
event handlers. Do not treat that href as the destination. Prefer a verified stable address or the visible menu
entry; allow new tabs and inspect the resulting origin after navigation settles.

The portal contains native shadow roots inside Lightning components. A document-level selector can falsely
suggest that a screen has no controls. Traverse open shadow roots, wait for the requested component and expected
headings, and distinguish hidden dialogs and controls from visible ones. Generated DOM IDs are not stable selectors.
Some linked applications use a different interface language from the portal.

## Portal home and internal pages

All paths in this section are relative to `https://keiouniversity.my.site.com`.

| Feature | Path / entry | Observed structure and purpose |
|---|---|---|
| Home | `/students/s/` | Quick links: `塾生サイト`, `K-LMS`, `休講・補講`, `履修申告`, `登録済科目`, `学業成績表`; Messages, News, and a Canvas-related component |
| Messages | Home Messages panel | Personal and important notices, according to portal help. Panel structure observed; individual messages not opened |
| News search | `/students/s/NewsSearchScreen`, via `すべてのニュースを表示` | Filters: `カテゴリ`, `重要度`, `年度`, `地区`, `課程`, `学部研究科`, `学科専攻`, `学年`, `公開日From`, `公開日To`; keyword search input. Date input names include `dateFrom` and `dateTo` |
| Applications | `/students/s/VariousApplication`, `申請` | Sixteen instruction accordions, followed by application-history tables. Columns include `申請名/Name`, `承認状況/Status`, `請求金額/Amount Billed`, `申請日時/Application Date`; a separate course-related table has `科目名/Course Name`, `申請状態/Status` |
| Surveys | `/students/s/survey`, `アンケート` | Survey selection and history; columns `アンケート Survey`, `回答状況 Response Status`, `回答完了日時 Complete Date`; `回答履歴表示 / View Response History`. Individual responses not opened |
| Course evaluation input | `/students/s/ClassEvaluation`, `授業評価入力` | Course selection table: `科目 Course`, `入力締切 Deadline`, `回答済 Done`; `次へ`. No evaluation was started |
| Course evaluation results | `/students/s/ClassEvaluationSearch`, `授業評価結果` | Course and main-lecturer text inputs; campus, faculty, semester filters; `検索 Search`, `クリア Clear`; result columns `科目名 Course Name`, `主担当者 Main Lecturer`, `学期 Semester`, `曜日時限 Day/Period`, `キャンパス Campus`, `学部 Faculty`. Individual results not opened |
| FAQ | `/students/s/topic/{topic}/all`, `よくある質問（FAQ）` | Search input, question list, `さらに読み込む`, related topics. Keep the menu route rather than hard-coding a Salesforce topic identifier |
| Inquiry | `/students/s/contactsupport`, `問い合わせ` | Required `件名`, `説明`; `Upload File`; `登録`. History columns `件名/Subject`, `説明/Description`, `最終更新日/LastModifiedDate`. No inquiry submitted or existing conversation opened |
| Help | `/students/s/article/ksupport` | Official explanation of News, Messages, applications, FAQ, inquiries, and reply notifications |

The help article says the home News panel targets the student's campus and faculty/graduate school; use the full
news search to find other groups' notices. Important notices may also be sent to Keio Mail. For inquiries, it directs
students to check published information first; replies are available in `コメント履歴`, with additional questions
entered through `お問い合わせコメント入力`. That reply workflow is documented by help, not tested on an actual case.

## Application instructions

Every accordion below was expanded. Each exposes a separate `申請` action; that action and the subsequent forms
were not tested. Explain the relevant instructions and let the student perform the application.

| Exact label | Function described by its instructions |
|---|---|
| `保証人変更` | Report a change of guarantor; supporting documents are required |
| `改姓改名（本人）` | Report a student's name change; includes identity-document and student-card guidance |
| `改姓改名（保証人）` | Report a guarantor's name change |
| `海外住所登録（本人）` | Register, update, or delete the student's overseas address |
| `海外住所登録（保証人）` | Register, update, or delete a guarantor's overseas address |
| `国内緊急連絡先` | Report an emergency contact in Japan for the situations described in the guidance |
| `休学願` | Apply for temporary leave; requirements, deadlines, and documents depend on the faculty/graduate school |
| `国外留学` | Apply for study abroad; refers students to their faculty/graduate-school rules |
| `就学届` | Notify return to study after temporary leave or study abroad |
| `在学期間延長（大学院生）` | Request an enrollment extension for eligible doctoral students |
| `所定単位取得退学届` | Request the applicable doctoral-course withdrawal status after prescribed requirements are met |
| `学生証再交付` | Request a replacement student card; loss and name-change cases have preceding steps |
| `証明書発行（厳封・特殊証明書等）` | Request sealed or special certificates; distinguished from the ordinary certificate service |
| `(教職)教員免許状取得見込証明書` | Request a prospective teaching-license certificate |
| `在留資格認定証明書（COE）申請` | COE application for the return-to-study circumstances stated in the instructions; not a general admissions COE form |
| `在留情報登録` | Report updated residence information and provide the specified residence-card documents |

Instructions contain eligibility, documents, deadlines, fees, and contacts where relevant. Re-read the live
instructions for a particular question; this inventory deliberately does not freeze those changing details.
Residence procedures should be explained from official instructions without collecting residence-card images.

## My Page

Observed at `/students/s/MyPage`:

- `全般 General`.
- `休学・留学歴 History of Temporary Leave of Absence / Study Abroad`.
- `休学学期数 The Number of Temporary Leave of Absence`.
- `学生本人銀行口座情報 Student's Own Bank Account Information`.
- `登録済スコア Recorded Score`.
- Notification settings, separate from the general student-information areas.

The banking area contains a bank/branch lookup and fields labeled `銀行コード Bank Code`, `銀行名 Bank Name`,
`支店コード Branch Code`, `支店名 Branch Name`, `口座番号(7桁) Account Number(7-digit number)`, account name, and
registration date. `検索 Search`, `クリア Clear`, and `保存 Save` are present. No bank values were extracted, no
lookup was performed, and no account information was changed. This area should be excluded from routine extraction.

Notification channels include Keio Mail and the Keio app. Categories are `学事`, `学生生活`, `奨学金`, `就職`,
`国際`, `イベント`, `システム`, `その他`. The interface says `学事` cannot be changed and disabling a category
also disables its bell notifications. `変更を保存する` changes settings and must remain with the student.
No current notification preferences are recorded.

## Teaching applications: inspected pages

| Menu label | Observed address | Structure and limits |
|---|---|---|
| `登録済科目確認` | `https://gacad.keio.jp/rishu/confirm` | `春学期`, `秋学期`, `科目一覧`; timetable grids with weekdays and periods; credit summary and course table described below |
| `休講・補講・任意設定講義情報` | `https://gacad.keio.jp/rishu/lecInfo` | `履修中科目` / `検索条件指定`; campus (`AREACD`), faculty (`FACULTY_FILTER`), `科目名`, `担当教員名`, `開始`, `終了`. Results and display-trigger behavior still need testing |
| `学業成績表` | `https://gacad.keio.jp/rcs/login` | Initial identity-header table plus `Display` / `Logout`. Identity values must be skipped |
| Grade display | `https://gacad.keio.jp/rcs/topMenu` | `Display` was verified to open an HTML report, not request an export. GPA area and course-table headers including `Subject`, `Grade`, `Credit`, `Year`, `Semester`, `Year Level`; `back` returns to the menu |
| `試験時間割` | `https://gexam.keio.jp/exam-tt/` | Page opened; no published exam timetable was available, so result-table columns could not be verified |
| `シラバス・時間割検索` | `https://gslbs.keio.jp/syllabus/search` | Search form inspected; details below. Search results and course details not yet tested |
| `履修申告` | `https://gacad.keio.jp/rishu/menu` | Landing only; no registration or cancellation performed |
| `Webエントリーシステム` | `https://gacad.keio.jp/entry/login` | Entry menu with `エントリー入力・修正・取消` and `エントリー内容確認／印刷`; `エントリー内容確認` control, Japanese/English switch, logout. No entry or print action performed |
| `GIC科目 履修申告・単位取得状況確認` | `https://gacad.keio.jp/gsc/login` | Landing only; language and logout controls observed |
| `K-LMS：学修支援システム（Canvas LMS）` | `https://lms.keio.jp/` | Dashboard landing only. Course pages, assignments, calendar, grades, messages, and files were not inspected |
| `教職課程` | Menu entry | Click attempted; final destination not verified |

Registered-course credit summary headers:

- `分野コード`, `分野`.
- `今学期以降取得見込み`, `前学期までに取得済`, `合計`.

Registered-course list headers:

- `科目名`, `担当者名`, `単位`, `学期`, `曜日時限`, `授業実施形態`.
- `登録番号`, `設置`, `登録状況`, `分野`.

These are observed column meanings, not graduation rules. Do not equate expected credits with earned credits or
infer graduation eligibility from the sum. The requirements and grade/GPA interpretation for each faculty,
program, and entry cohort still need official-source research. Do not inherit Shonan Institute of Technology rules.

### Syllabus search fields

The form supports keyword and K-Number searches. Observed controls include:

| Group | Visible concepts / field names |
|---|---|
| Period | `年度` (`KEYWORD_TTBLYR`), `学期` (`KEYWORD_SMSCD`), half-semester (`KEYWORD_HALFSEMESTER`); a separate KBS semester selector |
| Organization | `キャンパス` (`KEYWORD_CAMPUS`), `学部・研究科` (`KEYWORD_PRGANDFCD`), `学科・専攻` (`KEYWORD_DEPCD`), year level (`KEYWORD_LVL`) |
| Text | `科目名` (`KEYWORD_KAMOKUNM`), `担当者名` (`KEYWORD_TANTONM`), keyword (`KEYWORD_KEYWORD`) |
| Schedule | Day (`KEYWORD_DOWCD`), period (`KEYWORD_PDCD`) |
| Delivery | Teaching format (`KEYWORD_LESSONTYPE`), language (`KEYWORD_LESSONLANG`) |
| Curriculum | Applicable regulations (`KEYWORD_SCRGUTP`), field categories (`KEYWORD_FLD1CD`, `KEYWORD_FLD2CD`) |
| Other | Active learning, professional experience, other course conditions |
| SFC-related | English support, enrollment restrictions, selection method, teaching location |
| K-Number | `KNUMBER_`-prefixed controls for organization, level, classifications, course type, delivery, language, and academic field |

Visible actions include `検索`, `▼ 細かい条件を指定する`, `▼ K-Numberとは`. No account-specific selected defaults
are recorded. Available options may depend on other filters; re-inspect after changing organization or year.

## Other applications and navigation boundaries

These menu entries were inventoried. Opening a landing page does not verify all functions of the linked service.
Addresses are observed destinations, not a claim that direct navigation bypasses authentication requirements.

| Exact menu label | Observed destination / coverage | Boundary |
|---|---|---|
| `医療給付申請` | `gakukenpo.adst.keio.ac.jp`, authorization-error landing | No medical claim opened |
| `学生団体活動支援システム` | `https://studentlife.gakuji.keio.ac.jp/`, landing only | No club records or applications inspected |
| `奨学金Web申請システム` | `gakushogaku.adst.keio.ac.jp`, landing only | Session-bearing URLs must not be copied; no application opened |
| `学費Navi` | `https://tuition.adst.keio.ac.jp/kafn/userTop` | Payment and fee-statement controls inspected; no amounts or payment references extracted |
| `IT活用Web講座` | Google sign-in landing | Stopped before sign-in |
| `新入生お知らせ` | `https://fresh.keio.jp/fns/login`, landing only | Availability not established |
| `ソフトウェアライセンス取得システム` | `https://slc.keio.jp/slc/login`, landing only | No license keys or downloads inspected |
| `感染症罹患報告` | `https://www.hcc.keio.ac.jp/ja/infection/report.html`, landing only | No report initiated |
| `医学部レクチャーアーカイブ` | `https://archive.med.keio.ac.jp/`, landing only | No recordings opened |
| `健康診断結果確認` | `hmnwb02.adst.keio.ac.jp`, landing only | No health results extracted |
| `証明書発行サービス` | `https://www.students.keio.ac.jp/com/procedure/certificate/issue.html` | Opens official guidance; no certificate order started |
| `Zoom（Web会議システム）` | `https://secure.itc.keio.ac.jp/c/a/itc/ja/software_license_zoom.html` | Landing only; no setup or downloads |
| `災害時安否確認システム` | Menu entry; destination not verified | No safety response sent |
| `KOSMOS My Library` | `https://search.lib.keio.ac.jp/discovery/account`, via library authentication | Landing only; no loans, renewals, reservations, or requests inspected |
| `リモートアクセス（KOSMOS/データベースナビ）` | `https://auth.lib.keio.ac.jp/dbej/`, landing only | No database content retrieved |
| `就活支援サイト・体験記・進路届` | `https://taikenki.adst.keio.ac.jp/`, landing only | No career reports or personal records opened |
| `求人ナビ（キャリタスＵＣ）` | External-service SSO transition | Final destination and function availability unverified |
| `ＯＢ・ＯＧ訪問システム（eメール送信用）` | `jukuin-contact.keio.jp`, landing only | No alumni search or email sent |
| `理工学研究科博士課程KLL助成金申請` | `stkllap.adst.keio.ac.jp`, landing only | No grant application opened |
| `研究倫理・コンプライアンス教育eラーニングアカウント申請` | `citi.rcp.keio.ac.jp`, landing only | No account request made |
| `塾内研究助成` | `https://jukunai-josei.rcp.keio.ac.jp/keiojp/`, landing only | No grant application opened |
| `Dr.Budget（大学院生）` | `drbweb.adst.keio.ac.jp`, landing only | No budget records or operations inspected |

Google Workspace menu entries: `ホーム`, `メール`, `ドライブ`, `カレンダー`, `グループ`, `連絡先`, `Gemini`,
`Gemini Notebook`. These were recorded from the menu; inboxes, files, contacts, calendars, and AI conversations
were not explored as part of portal discovery.

Account/security menu entries: `My Account`, `パスワード変更・多要素認証設定`, `ITCアカウント設定`,
`通知用メールアドレス登録`, `Wi-Fi利用登録`, `keiomobile 2 / eduroam`. These are menu-only observations. Do not
open credential-revealing views, read recovery material, change security settings, or register devices for students.

## Action classification for the planned skill

**Read-only candidates already observed:** open stable query pages; expand application instruction accordions;
read table headings; show the HTML grade report using `Display`; return using `back`; inspect FAQ/help; sign out.
Searches and display filters need per-page verification before being added to the allowed-action list.

**Leave to the student:**

- `申請`, inquiry `登録`, file `Upload File`, survey/evaluation completion, registration/cancellation, and entry changes.
- `変更を保存する`, bank-account `保存 Save`, and all account, notification, address, and security changes.
- Payment actions in 学費Navi: `インターネットバンキング/ATMで納入する（Pay-easy）`,
  `銀行窓口で納入する（振込依頼書）`, `海外から納入する（Flywire）`, `手続きを開始する`.
- `振込用紙出力`, printing, exports, certificate orders, and file downloads from personal systems.
- Library renewals/reservations, safety reports, career submissions, alumni email, and grant applications.

`次へ` in an evaluation or application workflow is not a general safe-navigation control. Do not infer safety from
a button's label alone. Hidden confirmation dialogs do not mean an operation is in progress.

## Preparation still needed before shipping a skill

1. Verify login labels, authentication expiry, and whether each linked application requires its own logout.
   Portal logout completion was verified; the successful application-logout message does not establish global SSO
   logout or a common timeout for all services.
2. Inspect News/Message detail structure without copying content; account for possible read-status changes.
   Verify inquiry-reply and application-history layouts only when relevant, with the student present.
3. Test display filters, search results, pagination, empty states, and course-detail layouts. An unavailable exam
   timetable must remain an explicit coverage gap.
4. Write question-specific extraction expressions that exclude identity headers, banking, medical information,
   and unrelated rows. Run them in the browser and report only schema/count checks during development.
   Table existence and column structure were checked in this survey, but production extraction is not yet verified.
5. Obtain faculty/program/cohort-specific official grading, GPA, progression, graduation, and attendance sources.
6. Confirm differences across faculties, student statuses, interface languages, and academic years. Other
   accounts were not inspected, and the present account's menu cannot establish universal access.
7. Create the `keio` pack with its own manifest, Hatch, changelog, skill, references, and translated UI metadata;
   copying school-specific rules or publisher details from the reference pack would be incorrect.
8. Declare each actually supported personal origin separately. The portal, academic systems, syllabus, exam site,
   and Canvas are different origins; listing `keio.jp` alone will not cover them. A menu link is not sufficient
   reason to grant a future skill access to all external applications.
9. Test the resulting skill in Tomo with the contributor present; this CDP discovery is not a Tomo end-to-end test.

## Official sources

- [K-Support help](https://keiouniversity.my.site.com/students/s/article/ksupport) — authenticated help inspected in the browser.
- [Keio student Web systems](https://www.students.keio.ac.jp/com/class/system/index.html).
- [Online grade report user guide](https://www.students.keio.ac.jp/en/com/class/grade/manual.html) — confirms `Display`, `back`, and logout workflow; also describes scheduled maintenance.
- [Course registration and syllabus guidance](https://www.students.keio.ac.jp/sfc/class/registration/).
- [K-Number documentation](https://www.students.keio.ac.jp/com/class/registration/k-number.html).

Refresh live instructions when answering questions. This survey does not establish deadlines, eligibility,
payment amounts, health interpretation, or academic requirements.

## Follow-up: academic extraction

The initial `packs/keio/skills/k-support/` skill was subsequently created and its course-card and English
grade-row extraction checked in the browser. The course-list display is card-based; the ten field labels
originally inventoried as a course table belong to a hidden detail modal. See the skill's
`references/extract.md` for the maintained extraction and verification status.

The initial GPA parser stopped at an empty cell beside the generic heading and missed `SEMESTER:` and
`CUMULATIVE:` inline cells in the same `table.GPA`. After the contributor pointed out the scope labels, both
numerical fields were extracted and checked against the live display. No actual GPA values are recorded here.
A credit-summary header without data rows correctly produces unavailable results. Populated credit summaries
and regular weekday schedules were checked with synthetic DOM rather than populated real results in this session.
No personal values or real-account row counts are stored in the skill.
The contributor explicitly requested that the follow-up session remain signed in; it was not logged out.

A further completeness pass verified all eight grade columns (`Subject`, `Lecturer`, `Grade`, `Credit`,
`Makeup Exam`, `Year`, `Semester`, `Year Level`), the displayed `Determination` label/value pair, report title,
category `Total Credits` rows, and `Notice`. These academic sections are now selectable extraction fields.
Identity headers remain intentionally excluded. No actual determination, grades, credit totals, or notice text
from the account are stored in these notes or fixtures.

My Page was subsequently verified using composed-tree traversal through native shadow roots and assigned
slots. General contains exact labels for student number, name, program, affiliation, department/major,
year level, and class. The history section has separate leave/study-abroad labelled lists, and the count
section has `現在の休学学期数:`. `scripts/read-profile.js` now exposes only requested academic fields;
names/student numbers return placeholder objects. Labelled empty histories and the count field were verified
live without recording their values; populated histories were checked using fictional data. Banking and
settings were excluded. The contributor's session remained signed in.

Registered-course details were subsequently read from the visible information modal, including format,
registration number, offering, registration status, and field. Empty status is preserved rather than inferred.
Canvas's all-courses list, available course menus and existing grade views, the school timetable tool, and
Tools directory were inspected for attendance. No explicit attendance-history table was found. Quiz attempts
were not opened. Official KIC guidance describes quiz-based check-in, which must remain with the student.
See the skill's `references/attendance.md` for coverage limits and the next information needed.
