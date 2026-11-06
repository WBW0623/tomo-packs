# Changelog

## 0.1.0 (unreleased)

- Pack skeleton: manifest, Hatch questionnaire, SOUL fragment.
- `campussquare` skill: reads timetable, grades, credits, GPA and the self-checks from CampusSquare in the visible
  browser; read-only, the student signs in.
- Quick topics: My timetable, Credits & graduation.
- CampusSquare is a personal-data site (`personal_origins`): Tomo shows the model only headings and controls of its
  pages and asks the student before sending any value read there; the Hatch answer "No" to grade reading refuses it
  (`personal_consent`). The skill no longer asks for permission itself.
- `school-info` skill: searches the official website in Japanese (`site:shonan-it.ac.jp`), reads its pages and PDFs
  (academic calendar, procedures, international-student support, notices) and offers once to keep a PDF in
  Documents › Tomo › shonan-it for next time. Quick topic: Calendar & procedures.
- `campussquare`, checked with a 3rd-year account: per-course attendance (`○` / `欠` / `他`, five absences = `Y`
  failed with no exception, lateness per the instructor's rule) with a one-call extraction, classrooms from the schedule, the official meaning of `Ｄ` / `未` (`X`, `Y`,
  `Z`) and GPA rules, failed and retaken courses, and lower-year self-checks (the 3rd-year judgement is the
  graduation-research requirement; a 4th-year judgement shows `留年` until the remaining courses are taken).
- Hatch: the faculty comes from the student number's third character (A 工学部, B 情報学部, T 大学院, any other letter
  left for the student to pick); graduate school and its majors (機械工学専攻, 電気情報工学専攻) added.
