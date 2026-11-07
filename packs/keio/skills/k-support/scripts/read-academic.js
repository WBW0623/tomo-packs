(() => {
  // Edit only REQUEST for the student's question. Do not run on another origin.
  const REQUEST = {
    kind: "timetable", // timetable | course-detail | grades | gpa | credits | report
    fields: ["course", "term", "dayPeriod"],
    course: null, // exact displayed course name, or null for all requested courses
    year: null, // exact displayed academic year, or null
    term: null, // exact displayed semester label, or null
    day: null, // Japanese weekday 月..土, or null; only for timetable queries
    gpaScope: null, // semester | cumulative | null (all displayed GPA scopes)
    limit: 100,
  };
  const clean = value => String(value ?? "").replace(/\s+/g, " ").trim();
  const key = value => clean(value).normalize("NFKC").toLowerCase();
  const fail = error => JSON.stringify({ error });
  if (location.origin !== "https://gacad.keio.jp") return fail("wrong_origin");
  if (!["timetable", "course-detail", "grades", "gpa", "credits", "report"].includes(REQUEST.kind)) return fail("unknown_query");
  const gradesPage = location.pathname === "/rcs/topMenu";
  const coursesPage = location.pathname === "/rishu/confirm";
  if ((["grades", "gpa", "report"].includes(REQUEST.kind) && !gradesPage) ||
      (["timetable", "course-detail", "credits"].includes(REQUEST.kind) && !coursesPage)) return fail("open_expected_result_page");
  if (!Number.isInteger(REQUEST.limit) || REQUEST.limit < 1 || REQUEST.limit > 500) return fail("invalid_limit");

  const identityLabel = /^(?:student\s*(?:id|number|name)|name|氏名|学籍番号)$/i;
  const tables = [...document.querySelectorAll("table")].filter(table =>
    !table.querySelector("table") && ![...table.rows].some(row => identityLabel.test(clean(row.cells[0]?.innerText))));
  const cells = row => [...row.cells].map(cell => clean(cell.innerText));
  const aliases = {
    course: ["科目名", "Subject", "Course Name"],
    instructor: ["担当者名", "担当教員名", "Instructor", "Lecturer"],
    credits: ["単位", "Credit", "Credits"],
    term: ["学期", "Semester", "Term"],
    dayPeriod: ["曜日時限", "Day/Period", "Day and Period"],
    format: ["授業実施形態", "Class Format"],
    registration: ["登録番号", "Registration Number"],
    offering: ["設置", "Offering Faculty"],
    status: ["登録状況", "Registration Status"],
    field: ["分野", "Category"],
    room: ["教室", "Classroom", "Room"],
    grade: ["成績", "評価", "Grade"],
    makeupExam: ["追試験", "Makeup Exam"],
    year: ["年度", "Year", "Academic Year"],
    yearLevel: ["学年", "Year Level"],
    fieldCode: ["分野コード"],
    expected: ["今学期以降取得見込み"],
    earned: ["前学期までに取得済"],
    total: ["合計"],
  };
  // Question-mark help icons may be part of a column heading, but values are never used as headers.
  const headingKey = value => key(value).replace(/\s*[?？]\s*$/, "");
  const fieldFor = heading => Object.keys(aliases).find(field =>
    aliases[field].some(label => headingKey(heading) === key(label)));

  if (REQUEST.kind === "course-detail") {
    const allowed = ["course", "instructor", "credits", "term", "dayPeriod", "format", "registration", "offering", "status", "field", "room"];
    if (!Array.isArray(REQUEST.fields) || !REQUEST.fields.length || REQUEST.fields.some(field => !allowed.includes(field))) return fail("invalid_fields_for_query");
    if (typeof REQUEST.course !== "string" || !clean(REQUEST.course)) return fail("exact_course_required_for_detail");
    const modals = [...document.querySelectorAll(".modal.show")];
    if (modals.length !== 1) return fail("open_requested_course_detail");
    const pairs = new Map();
    for (const row of modals[0].querySelectorAll("tr")) {
      if (row.cells.length !== 2 || row.cells[0].tagName !== "TH" || row.cells[1].tagName !== "TD") continue;
      const field = fieldFor(row.cells[0].innerText);
      if (!field || !allowed.includes(field)) continue;
      if (pairs.has(field)) return fail("ambiguous_course_detail_field");
      pairs.set(field, clean(row.cells[1].innerText));
    }
    if (!pairs.has("course") || key(pairs.get("course")) !== key(REQUEST.course)) return fail("course_detail_does_not_match_request");
    const values = {}, unavailableFields = [], emptyFields = [];
    for (const field of REQUEST.fields) {
      if (!pairs.has(field)) { unavailableFields.push(field); continue; }
      values[field] = pairs.get(field);
      if (!values[field]) emptyFields.push(field);
    }
    return JSON.stringify({ kind: "course-detail", fields: REQUEST.fields, values, unavailableFields, emptyFields });
  }

  if (REQUEST.kind === "report") {
    const allowed = ["determination", "reportTitle", "categoryCredits", "notice"];
    if (!Array.isArray(REQUEST.fields) || !REQUEST.fields.length ||
        REQUEST.fields.some(field => !allowed.includes(field))) return fail("invalid_fields_for_query");
    const values = {}, unavailableFields = [];
    let truncated = false;
    for (const field of REQUEST.fields) {
      if (field === "determination") {
        const labels = [...document.querySelectorAll("table.User th")].filter(cell =>
          /^(Determination|判定|進級判定|卒業判定)$/i.test(clean(cell.innerText)));
        if (labels.length !== 1 || labels[0].nextElementSibling?.tagName !== "TD" ||
            labels[0].nextElementSibling.querySelector("table")) { unavailableFields.push(field); continue; }
        const value = clean(labels[0].nextElementSibling.innerText);
        if (value) values[field] = { label: clean(labels[0].innerText), value };
        else unavailableFields.push(field);
      } else if (field === "reportTitle") {
        const title = [...document.querySelectorAll("h1,h2,h3")].find(element =>
          /^KEIO UNIVERSITY GRADE REPORT\b/i.test(clean(element.innerText)));
        if (title) values[field] = clean(title.innerText);
        else unavailableFields.push(field);
      } else if (field === "notice") {
        const notices = [...document.querySelectorAll("table.message")].filter(table =>
          [...table.querySelectorAll("th")].some(cell => /^(Notice|注意事項)$/i.test(clean(cell.innerText))));
        if (notices.length !== 1) { unavailableFields.push(field); continue; }
        values[field] = [...notices[0].querySelectorAll("td")].map(cell => clean(cell.innerText)).filter(Boolean);
      } else if (field === "categoryCredits") {
        const candidates = tables.filter(table => [...table.rows].some(row => {
          const fields = cells(row).map(fieldFor);
          return ["course", "grade", "credits"].every(required => fields.includes(required));
        }));
        if (candidates.length !== 1) { unavailableFields.push(field); continue; }
        const summaries = [...candidates[0].rows].filter(row => row.cells.length === 2 &&
          row.cells[0].colSpan === 6 && row.cells[1].colSpan === 2).map(row => {
            const summary = clean(row.cells[1].innerText);
            const match = summary.match(/^Total Credits\s+(\d+(?:\.\d+)?)$/i);
            return { category: clean(row.cells[0].innerText), label: "Total Credits",
              totalCredits: match ? match[1] : null, displayedSummary: summary };
          });
        if (!summaries.length) { unavailableFields.push(field); continue; }
        values[field] = summaries.slice(0, REQUEST.limit);
        truncated = summaries.length > REQUEST.limit;
      }
    }
    return JSON.stringify({ kind: "report", fields: REQUEST.fields, values, unavailableFields, truncated });
  }

  if (REQUEST.kind === "gpa") {
    if (REQUEST.gpaScope != null && !["semester", "cumulative"].includes(REQUEST.gpaScope)) return fail("invalid_gpa_scope");
    // Read GPA-labelled cells and verified scope/value cells within table.GPA only.
    const isGpaLabel = text => /^(?:(?:cumulative|term|semester|annual|overall)\s+gpa|gpa(?:\s*\((?:cumulative|term|semester|annual|overall)\))?|(?:累積|通算|学期|年度|総合)?gpa)$/i.test(key(text));
    const numeric = text => /^\d+(?:\.\d+)?$/.test(key(text));
    const results = [], unavailable = [];
    const add = (label, value, scope = null) => {
      const explicitScope = scope && /^(semester|cumulative)$/.test(scope) && /^(SEMESTER|CUMULATIVE)$/i.test(label);
      if ((!isGpaLabel(label) && !explicitScope) || !numeric(value)) return;
      if (!results.some(item => item.label === label && item.value === value)) results.push({ label, value,
        scope: scope ?? (/cumulative|累積|通算/i.test(label) ? "cumulative" : /semester|term|学期/i.test(label) ? "semester" : "unspecified") });
    };
    for (const table of tables.filter(table => ![...(table.rows[0]?.cells ?? [])].some(cell =>
      aliases.course.some(label => key(cell.innerText) === key(label))))) {
      const rows = [...table.rows];
      if (table.classList.contains("GPA")) {
        for (const cell of table.querySelectorAll("td,th")) {
          const scoped = clean(cell.innerText).normalize("NFKC").match(/^(SEMESTER|CUMULATIVE)\s*:\s*(.*)$/i);
          if (!scoped) continue;
          const label = scoped[1].toUpperCase(), scope = scoped[1].toLowerCase();
          if (numeric(scoped[2])) add(label, scoped[2], scope);
          else unavailable.push({ label, scope, reason: scoped[2] ? "non_numeric_display" : "blank_display" });
        }
      }
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = cells(rows[rowIndex]);
        for (let index = 0; index < row.length; index++) {
          if (!isGpaLabel(row[index])) continue;
          if (index + 1 < row.length && numeric(row[index + 1])) {
            add(row[index], row[index + 1]);
          } else if (row.every(isGpaLabel) && rows[rowIndex + 1]) {
            const below = cells(rows[rowIndex + 1]);
            if (below.length === row.length) add(row[index], below[index]);
          }
          if (!results.some(item => item.label === row[index])) {
            unavailable.push({ label: row[index], reason: clean(row[index + 1]) ? "non_numeric_display" : "blank_display" });
          }
        }
      }
    }
    if (!results.length && !unavailable.length) return fail("displayed_gpa_not_found_check_structure");
    const selected = results.filter(value => REQUEST.gpaScope == null || value.scope === REQUEST.gpaScope);
    return JSON.stringify({ kind: "gpa", available: selected.length > 0, values: selected,
      unavailable: unavailable.filter(item => !results.some(value => value.label === item.label) &&
        !(key(item.label) === "gpa" && results.some(value => value.scope !== "unspecified")) &&
        (REQUEST.gpaScope == null || item.scope === REQUEST.gpaScope)),
      requestedScopeUnavailable: REQUEST.gpaScope != null && selected.length === 0,
      scope: "Use each displayed label; do not infer its scope." });
  }

  const allowed = REQUEST.kind === "timetable"
    ? ["course", "instructor", "credits", "term", "dayPeriod", "format", "registration", "offering", "status", "field", "room"]
    : REQUEST.kind === "grades"
      ? ["course", "instructor", "grade", "credits", "makeupExam", "year", "term", "yearLevel", "field"]
      : ["fieldCode", "field", "expected", "earned", "total"];
  if (!Array.isArray(REQUEST.fields) || !REQUEST.fields.length ||
      REQUEST.fields.some(field => !allowed.includes(field))) return fail("invalid_fields_for_query");
  if (REQUEST.day != null && (REQUEST.kind !== "timetable" || !/^[月火水木金土]$/.test(REQUEST.day))) return fail("invalid_weekday_filter");

  if (REQUEST.kind === "timetable") {
    // The verified course list is made of cards, not the hidden key/value detail-modal table.
    const pane = document.querySelector("#course_regist-tab_sbjt");
    if (!pane) return fail("course_list_not_found_check_structure");
    const items = [...pane.querySelectorAll(".reg-list > .reg-list-item")];
    if (!items.length) return fail("no_course_cards_check_display_and_empty_state");
    if (REQUEST.year != null) return fail("requested_filter_column_unavailable");
    const exactTerm = /^(春学期|秋学期|通年|春|秋|Spring(?: Semester)?|Fall(?: Semester)?|Autumn(?: Semester)?|Full Year)$/i;
    const selector = { course: ".sbjtnm", instructor: ".lctnm", credits: ".credit", dayPeriod: ".daypd" };
    const prefixes = { registration: "登録番号", offering: "設置", field: "分野", status: "登録状況", room: "教室", format: "授業実施形態" };
    const get = (item, field) => {
      if (selector[field]) return clean(item.querySelector(selector[field])?.innerText);
      const spans = [...item.children].filter(element => element.tagName === "SPAN").map(element => clean(element.innerText));
      if (field === "term") return spans.find(text => exactTerm.test(text)) ?? "";
      const prefix = prefixes[field];
      if (!prefix) return "";
      const expression = new RegExp("^(?:【|\\[)?" + prefix + "(?:】|\\]|[:：])\\s*(.*)$");
      for (const text of spans) {
        const match = text.match(expression);
        if (match) return clean(match[1]);
      }
      return "";
    };
    const unknownTime = text => !text || /その他|不定期|集中|other|irregular/i.test(text);
    const rows = [], unavailable = new Set();
    let unmatchedSchedule = 0;
    for (const item of items) {
      if (!item.querySelector(".sbjtnm") || !item.querySelector(".daypd")) return fail("course_card_schema_changed");
      if (REQUEST.course != null && key(get(item, "course")) !== key(REQUEST.course)) continue;
      if (REQUEST.term != null && key(get(item, "term")) !== key(REQUEST.term)) continue;
      if (REQUEST.day != null) {
        const schedule = get(item, "dayPeriod");
        if (unknownTime(schedule)) { unmatchedSchedule++; continue; }
        if (!/[月火水木金土]/.test(schedule)) return fail("weekday_format_unrecognized");
        if (!schedule.includes(REQUEST.day)) continue;
      }
      const record = {};
      for (const field of REQUEST.fields) {
        const value = get(item, field);
        if (value) record[field] = value;
        else unavailable.add(field);
      }
      rows.push(record);
    }
    return JSON.stringify({ kind: "timetable", fields: REQUEST.fields, rows: rows.slice(0, REQUEST.limit),
      matchingRows: rows.length, truncated: rows.length > REQUEST.limit, unavailableFields: [...unavailable],
      irregularRows: 0, unscheduledCoursesNotMatchedToDay: unmatchedSchedule });
  }
  const required = REQUEST.kind === "timetable" ? ["course", "dayPeriod"]
    : REQUEST.kind === "grades" ? ["course", "grade", "credits"]
      : ["fieldCode", "field", "expected", "earned", "total"];
  const matches = [];
  for (const table of tables) {
    const rows = [...table.rows];
    for (let index = 0; index < rows.length; index++) {
      const headings = cells(rows[index]);
      const mapping = headings.map(fieldFor);
      if (required.every(field => mapping.includes(field))) {
        matches.push({ rows, index, headings, mapping });
        break;
      }
    }
  }
  if (matches.length !== 1) return fail(matches.length ? "ambiguous_result_table" : "result_table_not_found_check_structure");
  const { rows, index, headings, mapping } = matches[0];
  const requestedFilters = ["course", "year", "term"].filter(field => REQUEST[field] != null);
  if (requestedFilters.some(field => !mapping.includes(field))) return fail("requested_filter_column_unavailable");
  const unavailableFields = REQUEST.fields.filter(field => !mapping.includes(field));
  const output = [];
  let irregularRows = 0, sectionRows = 0;
  for (const row of rows.slice(index + 1)) {
    const values = cells(row);
    if (!values.some(Boolean)) continue;
    if (REQUEST.kind === "grades" &&
        ((row.cells.length === 2 && row.cells[0].colSpan === 6 && row.cells[1].colSpan === 2) ||
         (row.cells.length === 1 && row.cells[0].colSpan === headings.length))) {
      sectionRows++;
      continue;
    }
    if (values.length !== headings.length) { irregularRows++; continue; }
    if (values.every((value, column) => headingKey(value) === headingKey(headings[column]))) continue;
    if (requestedFilters.some(field => key(values[mapping.indexOf(field)]) !== key(REQUEST[field]))) continue;
    const record = {};
    for (const field of REQUEST.fields) {
      const column = mapping.indexOf(field);
      if (column >= 0) record[field] = values[column];
    }
    output.push(record);
  }
  return JSON.stringify({
    kind: REQUEST.kind,
    fields: REQUEST.fields.filter(field => !unavailableFields.includes(field)),
    rows: output.slice(0, REQUEST.limit),
    matchingRows: output.length,
    truncated: output.length > REQUEST.limit,
    unavailableFields,
    irregularRows,
    sectionRows,
    available: REQUEST.kind === "credits" ? output.length > 0 : undefined,
    unavailableReason: REQUEST.kind === "credits" && output.length === 0 ? "no_category_rows_displayed" : undefined,
  });
})()
