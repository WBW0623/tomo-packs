# Keio University Pack

- EN: Published by WBW ([WBW0623](https://github.com/WBW0623)). Intended for undergraduate and graduate students
  across all Keio faculties and graduate schools through the shared K-Support entry. Hatch uses free-text
  academic-context inputs without a preset faculty/major list. This scope is distinct from the account variants
  actually tested below.
- ZH: 发布者为 WBW（[WBW0623](https://github.com/WBW0623)）。首版通过统一的 K-Support 入口面向庆应全校各学部和大学院，
  学籍背景均使用输入框，不预置学部、学科或专攻列表。适用范围与下列已完成的账号实测范围分别说明。
- JA: 公開者はWBW（[WBW0623](https://github.com/WBW0623)）です。共通のK-Support入口を利用する慶應の全学部・大学院生を対象にします。
  所属情報は自由入力とし、学部・学科・専攻の選択肢を固定しません。対象範囲と以下の実画面で検証した範囲は区別しています。

- EN: Community pack for academic queries through K-Support. Course cards, English grade rows, and numerical
  semester/cumulative GPA were checked in a real browser; populated credit summaries remain a live-verification gap.
  Not affiliated with or endorsed by Keio University.
- EN: My Page student-profile fields, displayed leave/study-abroad groups, and the leave-semester count are
  supported. Identifier fields return placeholders; banking and settings are excluded.
- EN: Registered-course detail dialogs are supported. Attendance-source discovery is documented, but a real
  attendance-history schema has not yet been verified; this pack does not register attendance.
- ZH: 通过 K-Support 查询学业记录的社区学校包。课程卡片与英文成绩行已在真实浏览器验证，
  学期与累积 GPA 的数值读取也已实测；有数据的学分汇总仍待实测。
  本包与庆应义塾大学无隶属或背书关系。
- ZH: 支持 My Page 学籍字段、页面显示的休学／留学历史和休学学期数；身份字段返回占位符，不读取银行账户或修改设置。
- ZH: 支持已登记课程详情；已记录出席来源查找流程，但真实出席历史结构尚未验证，本包不会代为签到。
- JA: K-Supportを通じた学修記録の照会を支援するコミュニティパックです。科目カード・英語版成績行・学期GPAと累積GPAの数値を実画面で検証済みです。
  データのある単位集計は未検証です。慶應義塾大学の公式サービス・公認パックではありません。
- JA: My Pageの学籍項目・表示された休学留学歴・休学学期数に対応しています。識別情報はプレースホルダーで返し、銀行口座や設定変更は対象外です。
- JA: 登録済科目の詳細表示に対応しています。出席記録の探し方は記載していますが、実際の履歴構造は未検証で、出席登録は行いません。

| File | Purpose |
|---|---|
| `pack.yaml` | Metadata, academic-browser permissions, consent, quick topics |
| `hatch.yaml` | Academic context and local identifier placeholders |
| `soul.md` | Keio-specific boundaries and interpretation |
| `skills/k-support/` | Academic workflow, page routes, extraction expression |
| `evals/cases.yaml` | Questions for academic-query evaluation |

- EN: Version 0.1.0 ships the K-Support record-reading skill only. Official-website research, Tomo end-to-end
  trials and broader live-page verification are planned for the next version. It does not independently
  determine graduation/progression eligibility or extract verified attendance totals.
- ZH: 0.1.0 仅提供 K-Support 记录读取 skill。官网查询 skill、Tomo 实际试用和更广的页面验证安排在下一版本；
  当前不独立判断毕业／升学年资格，也不提供已验证的出席次数提取。
- JA: 0.1.0にはK-Supportの記録読み取りスキルのみを含みます。公式サイト検索スキル、Tomoでの実機試用と
  幅広い画面検証は次のバージョンで実施予定です。現版は卒業・進級資格の独自判定や検証済みの出席回数抽出を行いません。
