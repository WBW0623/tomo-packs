(source => {
  // Synthetic DOM only. No real student records, snapshots, or account exports belong in this file.
  const base = { kind: "grades", fields: ["course", "grade", "credits", "year", "term"],
    course: null, year: null, term: null, day: null, limit: 100 };
  const identity = '<table><tr><th>Student ID</th><td>{{STUDENT_NUMBER}}</td></tr>' +
    '<tr><th>Name</th><td>{{FULL_NAME}}</td></tr></table>';
  const gradeTable = '<table class="main"><tr><th>Subject</th><th>Lecturer</th><th>Grade</th><th>Credit</th>' +
    '<th>Makeup Exam</th><th>Year</th><th>Semester</th><th>Year Level</th></tr>' +
    '<tr><td colspan="6">Fictional category</td><td colspan="2">Total Credits 3</td></tr>' +
    '<tr><td>Fictional Course A</td><td>Fictional Lecturer</td><td>A</td><td>2</td><td></td><td>2026</td><td>Spring</td><td>1</td></tr>' +
    '<tr><td>Fictional Course B</td><td>Fictional Lecturer</td><td>B</td><td>1</td><td></td><td>2025</td><td>Fall</td><td>1</td></tr>' +
    '<tr><td colspan="8">End of fictional table</td></tr></table>';
  const courseList = '<div id="course_regist-tab_sbjt"><div class="reg-list">' +
    '<div class="reg-list-item"><span class="sbjtnm">Fictional Course A</span><span>春学期</span>' +
    '<span class="daypd">火2</span><span class="credit">2</span></div>' +
    '<div class="reg-list-item"><span class="sbjtnm">Fictional Course B</span><span>秋学期</span>' +
    '<span class="daypd">その他</span><span class="credit">1</span></div></div></div>';
  const read = (html, request = {}, origin = "https://gacad.keio.jp") => {
    const merged = { ...base, ...request };
    const document = new DOMParser().parseFromString(identity + html, "text/html");
    // Detached parsed documents do not lay out innerText; provide its text-only fixture equivalent.
    for (const node of document.querySelectorAll("*")) Object.defineProperty(node, "innerText", { get() { return this.textContent; } });
    const expression = source.replace(/const REQUEST = \{[\s\S]*?\n  \};/,
      "const REQUEST = " + JSON.stringify(merged) + ";");
    const pathname = ["timetable", "course-detail", "credits"].includes(merged.kind) ? "/rishu/confirm" : "/rcs/topMenu";
    return JSON.parse(Function("document", "location", "return (" + expression + ");")(document, { origin, pathname }));
  };
  const checks = [];
  const check = (name, assertion) => {
    if (!assertion) throw new Error("Synthetic extraction check failed: " + name);
    checks.push(name);
  };
  let result = read(gradeTable);
  check("grade rows exclude category and footer rows", result.rows.length === 2 && result.sectionRows === 2 && result.irregularRows === 0);
  check("identity placeholders never returned", !JSON.stringify(result).includes("{{FULL_NAME}}") && !JSON.stringify(result).includes("{{STUDENT_NUMBER}}"));
  result = read(gradeTable, { fields: ["course", "instructor", "grade", "credits", "makeupExam", "year", "term", "yearLevel"] });
  check("all eight grade columns supported including empty makeup exam", result.rows.length === 2 && result.unavailableFields.length === 0 &&
    result.rows[0].instructor === "Fictional Lecturer" && result.rows[0].makeupExam === "" && Object.keys(result.rows[0]).length === 8);
  const reportContext = '<h1>KEIO UNIVERSITY GRADE REPORT, SPRING SEMESTER, 2026</h1>' +
    '<table class="User"><tr><th>Determination</th><td>FICTIONAL STATUS</td></tr></table>' +
    '<table class="User message"><tr><th>Notice</th></tr><tr><td>Fictional notice.</td></tr></table>';
  result = read(reportContext + gradeTable, { kind: "report", fields: ["determination", "reportTitle", "categoryCredits", "notice"] });
  check("report context contains only requested academic sections", result.unavailableFields.length === 0 &&
    result.values.determination.value === "FICTIONAL STATUS" && result.values.categoryCredits[0].totalCredits === "3" &&
    result.values.notice[0] === "Fictional notice." && !JSON.stringify(result).includes("{{FULL_NAME}}"));
  result = read(reportContext + gradeTable, { kind: "report", fields: ["determination"] });
  check("determination-only request excludes grades and other context", Object.keys(result.values).length === 1 && !Object.hasOwn(result.values, "notice"));
  result = read(gradeTable, { course: "Fictional Course B", fields: ["course", "grade"] });
  check("exact course and column restriction", result.rows.length === 1 && result.rows[0].grade === "B" && Object.keys(result.rows[0]).length === 2);
  result = read(gradeTable, { year: "2026", term: "Spring" });
  check("academic year and semester restriction", result.rows.length === 1 && result.rows[0].course === "Fictional Course A");
  result = read(gradeTable, { limit: 1 });
  check("truncation explicit", result.truncated === true && result.rows.length === 1 && result.matchingRows === 2);
  result = read(gradeTable, { fields: ["name"] });
  check("identity field rejected", result.error === "invalid_fields_for_query");
  result = read(gradeTable, {}, "https://example.invalid");
  check("wrong origin rejected", result.error === "wrong_origin");
  result = read(gradeTable + gradeTable);
  check("ambiguous tables rejected", result.error === "ambiguous_result_table");
  result = read('<table><tr><td>GPA</td><td>3.25</td></tr></table>', { kind: "gpa", fields: [] });
  check("numeric displayed GPA only", result.available === true && result.values.length === 1 && result.values[0].value === "3.25" && !Object.hasOwn(result, "rows"));
  result = read('<table><tr><th>Term GPA</th><th>Cumulative GPA</th></tr><tr><td>3.00</td><td>3.25</td></tr></table>', { kind: "gpa", fields: [] });
  check("separate GPA scopes preserved", result.available === true && result.values.length === 2);
  result = read('<table class="User GPA"><tr><td>GPA</td><td></td></tr>' +
    '<tr><td>SEMESTER:&nbsp;0.00</td><td>CUMULATIVE:&nbsp;3.25</td></tr></table>', { kind: "gpa", fields: [] });
  check("inline semester and cumulative GPA inside GPA table", result.available === true && result.values.length === 2 &&
    result.values.find(value => value.scope === "semester")?.value === "0.00" &&
    result.values.find(value => value.scope === "cumulative")?.value === "3.25" && result.unavailable.length === 0);
  result = read('<table class="User GPA"><tr><td>GPA</td><td></td></tr>' +
    '<tr><td>SEMESTER:&nbsp;0.00</td><td>CUMULATIVE:&nbsp;3.25</td></tr></table>',
    { kind: "gpa", fields: [], gpaScope: "cumulative" });
  check("cumulative-only request excludes semester GPA", result.values.length === 1 && result.values[0].scope === "cumulative");
  result = read('<table><tr><td>SEMESTER: 0.00</td><td>CUMULATIVE: 3.25</td></tr></table>', { kind: "gpa", fields: [] });
  check("unrelated semester numbers are not treated as GPA", result.error === "displayed_gpa_not_found_check_structure");
  result = read('<table><tr><td>GPA</td><td></td></tr></table>', { kind: "gpa", fields: [] });
  check("blank GPA is unavailable rather than zero", result.available === false && result.values.length === 0 && result.unavailable[0].reason === "blank_display");
  result = read(courseList, { kind: "timetable", fields: ["course", "term", "dayPeriod"], day: "火" });
  check("weekday filter retains unscheduled-course warning", result.rows.length === 1 && result.unscheduledCoursesNotMatchedToDay === 1);
  result = read(courseList, { kind: "timetable", fields: ["course", "room"] });
  check("missing classroom is not fabricated", result.unavailableFields.includes("room") && result.rows.every(row => !Object.hasOwn(row, "room")));
  const courseDetail = '<div class="modal show"><table><tr><th>科目名</th><td>Fictional Course A</td></tr>' +
    '<tr><th>担当者名</th><td>Fictional Lecturer</td></tr><tr><th>単位</th><td>2</td></tr>' +
    '<tr><th>学期</th><td>春学期</td></tr><tr><th>曜日時限</th><td>火2</td></tr>' +
    '<tr><th>授業実施形態</th><td>Fictional teaching format</td></tr><tr><th>登録番号</th><td>FICTIONAL_COURSE_CODE</td></tr>' +
    '<tr><th>設置</th><td>Fictional Faculty</td></tr><tr><th>登録状況</th><td></td></tr><tr><th>分野</th><td>Fictional category</td></tr></table></div>';
  result = read(courseDetail, { kind: "course-detail", course: "Fictional Course A", fields: ["course", "instructor", "credits", "term", "dayPeriod", "format", "registration", "offering", "status", "field"] });
  check("all ten registered-course detail fields including blank status", Object.keys(result.values).length === 10 &&
    result.unavailableFields.length === 0 && result.values.status === "" && result.emptyFields.includes("status"));
  result = read(courseDetail, { kind: "course-detail", course: "Fictional Course B", fields: ["course"] });
  check("stale detail from another course rejected", result.error === "course_detail_does_not_match_request");
  result = read(courseDetail, { kind: "course-detail", course: null, fields: ["course"] });
  check("course detail requires an explicit matching course", result.error === "exact_course_required_for_detail");
  result = read(courseDetail.replace('class="modal show"', 'class="modal"'), { kind: "course-detail", course: "Fictional Course A", fields: ["course"] });
  check("closed course modal is not read", result.error === "open_requested_course_detail");
  const creditHeader = '<table><tr><th colspan="3">分野コード</th><th>分野</th><th>今学期以降取得見込み ?</th><th>前学期までに取得済 ?</th><th>合計</th></tr>';
  result = read(creditHeader + '</table>', { kind: "credits", fields: ["field", "earned", "expected", "total"] });
  check("empty credit summary is unavailable rather than zero", result.available === false && result.unavailableReason === "no_category_rows_displayed");
  result = read(creditHeader + '<tr><td colspan="3">X</td><td>Fictional field</td><td>2</td><td>4</td><td>6</td></tr></table>',
    { kind: "credits", fields: ["field", "earned", "expected", "total"] });
  check("earned and expected credits kept separate", result.available === true && result.rows[0].earned === "4" && result.rows[0].expected === "2");
  return JSON.stringify({ passed: checks.length, checks });
})
