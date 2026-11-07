# Changelog

## 0.1.0

- EN: Finalize the first K-Support pack. Official-website research, Tomo end-to-end trials and broader live-page
  verification are deferred to the next version. Attendance-history extraction remains unverified.
- ZH: 完成首版 K-Support 学校包收尾。官网查询 skill、Tomo 实际试用及更广的页面验证留到下一版本；
  出席历史提取仍未验证。
- JA: K-Supportパックの初版を整備しました。公式サイト検索スキル、Tomoでの実機試用と幅広い画面検証は
  次のバージョンに延期します。出席履歴の抽出は未検証です。

- EN: Set publisher to WBW (WBW0623). Target undergraduate and graduate students across all Keio faculties and
  graduate schools. Academic-context fields use free text without a predefined faculty/major list; year level
  and entry year are asked only when needed. Intended coverage does not imply every account variant was tested.
- ZH: 发布者设为 WBW（WBW0623），首版面向庆应全校学部及大学院。学籍背景使用输入框，不预置学部或学科选项，
  年级和入学年度在需要时再询问；全校适用范围不代表所有账号界面均已实测。
- JA: 公開者をWBW（WBW0623）とし、慶應の全学部・大学院生を対象にします。所属情報は自由入力とし、学部・学科の選択肢を固定しません。
  学年と入学年度は必要時に尋ねます。対象範囲は、すべてのアカウント画面の検証完了を意味しません。

- EN: Add all ten registered-course detail fields with exact-course matching and blank-status handling.
  Document read-only attendance-source discovery in Canvas and launched school tools. No attendance-history
  table was found during inspection; per-course attendance extraction remains unverified and no check-in is performed.
- ZH: 补齐已登记课程详情的 10 个字段，核对课程名并保留空登记状态。补充 Canvas 和学校外部工具的出席记录查找流程，
  仅限只读；本次未找到出席历史表，各科出席提取仍待验证，不会代为签到。
- JA: 登録済科目の詳細10項目を追加し、科目名の照合と空の登録状況に対応しました。Canvasと学校外部ツールでの
  出席記録の探し方を追加しましたが、今回の調査では履歴表を確認できていません。科目別出席抽出は未検証で、出席登録は行いません。

- EN: Add My Page academic profile, displayed leave/study-abroad history, and current leave-semester count.
  Traverse nested shadow roots and assigned slots; identifier values always return placeholders. Extend the
  declared profile permission and academic-record consent explanation. Live labelled fields and empty history
  displays were checked; populated history lists were checked with fictional data.
- ZH: 新增 My Page 学籍、页面显示的休学／留学历史及当前休学学期数读取，支持嵌套 Shadow DOM 和插槽；
  姓名、学号始终返回占位符。同步补充资料读取权限与同意说明，已验证真实字段和历史空显示，有记录的历史列表使用虚构数据检查。
- JA: My Pageの学籍・表示された休学留学歴・現在の休学学期数の読み取りを追加しました。入れ子のShadow DOMとスロットに対応し、
  氏名と学籍番号は常にプレースホルダーで返します。資料読み取り権限と同意説明を更新し、実際の項目と空の履歴表示を確認済みです。
  記録のある履歴は架空データで確認しています。

- EN: Cover all eight course-grade columns, displayed Determination, report period, category Total Credits,
  and Notice. Each section can be requested separately; real values were checked in the browser without saving them.
- ZH: 补齐各科成绩的全部 8 列、网页显示的 Determination、报告期间、分类 Total Credits 和 Notice；
  可按问题分别读取，已通过真实页面核对，未保存个人数据。
- JA: 科目成績の全8列、表示されたDetermination、成績表の期間、区分別Total Credits、Noticeに対応しました。
  質問に応じて個別に読み取り、実画面と照合済みです。個人データは保存していません。

- EN: Add the initial K-Support academic-record skill for registered courses, timetable, grades, displayed GPA,
  and credit summaries. Browser-only, read-only, with student sign-in and consent. Course cards and English grade
  rows and numerical semester/cumulative GPA were verified in a real browser. GPA parsing handles inline scope
  labels instead of stopping at the blank generic heading. Empty credit summaries return unavailable, with
  populated summaries covered by synthetic checks;
  graduation judgments and coursework are outside this version.
- ZH: 新增 K-Support 学业记录技能草稿，面向已登记课程、课表、成绩、页面显示的 GPA 和学分汇总。
  仅通过浏览器只读访问，由学生自行登录并同意读取。课程卡片、英文成绩行、学期与累积 GPA 已实测；GPA 提取识别带数值的范围标签，
  不会停在空的通用标题旁。空学分表返回不可用，有数据的学分表通过虚构数据检查，暂不判断毕业资格或处理课程作业。
- JA: 登録済科目・時間割・成績・表示されたGPA・単位集計を対象とするK-Supportスキルの初期草稿を追加。
  学生本人のログインと同意のもと、ブラウザで閲覧のみ行います。科目カード・英語版成績行・数値の学期GPAと累積GPAを実画面で検証しました。
  GPAは空の共通見出しではなく範囲ラベル付きの値から読み取ります。空の単位集計は取得不可として扱い、データのある集計は架空データで確認済みです。
  卒業判定や課題提出は対象外です。
