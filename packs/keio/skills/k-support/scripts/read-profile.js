(() => {
  // Edit only REQUEST. Expand the requested My Page sections with the visible browser first.
  const REQUEST = { fields: ["program", "affiliation", "department", "yearLevel", "class"], limit: 100 };
  const clean = value => String(value ?? "").replace(/\s+/g, " ").trim();
  const text = element => clean(element?.innerText ?? element?.textContent);
  const key = value => clean(value).normalize("NFKC").replace(/\s*:\s*$/, "").toLowerCase();
  const fail = error => JSON.stringify({ error });
  if (location.origin !== "https://keiouniversity.my.site.com" || location.pathname !== "/students/s/MyPage") return fail("open_my_page");
  const labels = {
    studentNumber: ["学籍番号 Student ID Number", "学籍番号", "Student ID Number"],
    name: ["氏名 Name", "氏名", "Name"],
    program: ["課程 Program", "課程", "Program"],
    affiliation: ["学部・研究科 Affiliation", "学部・研究科", "Affiliation"],
    department: ["学科・専攻 Department/Major", "学科・専攻", "Department/Major"],
    yearLevel: ["学年 Year Level", "学年", "Year Level"],
    class: ["クラス Class", "クラス", "Class"],
    temporaryLeave: ["休学 Temporary Leave of Absence", "休学", "Temporary Leave of Absence"],
    studyAbroad: ["留学 Study Abroad", "留学", "Study Abroad"],
    leaveSemesters: ["現在の休学学期数"],
  };
  if (!Array.isArray(REQUEST.fields) || !REQUEST.fields.length || REQUEST.fields.some(field => !Object.hasOwn(labels, field))) return fail("invalid_profile_fields");
  if (!Number.isInteger(REQUEST.limit) || REQUEST.limit < 1 || REQUEST.limit > 500) return fail("invalid_limit");
  // Native shadow roots and assigned slot elements both occur in Salesforce Flow accordions.
  const collect = root => {
    const elements = [], seen = new Set();
    const visit = node => {
      if (!node || seen.has(node)) return;
      seen.add(node);
      if (node.nodeType === 1) elements.push(node);
      for (const child of node.children ?? []) visit(child);
      if (node.shadowRoot) visit(node.shadowRoot);
      if (node.tagName === "SLOT") for (const assigned of node.assignedElements({ flatten: true })) visit(assigned);
    };
    visit(root);
    return elements;
  };
  const headings = {
    general: ["全般 General", "全般", "General"],
    history: ["休学・留学歴 History of Temporary Leave of Absence / Study Abroad", "休学・留学歴", "History of Temporary Leave of Absence / Study Abroad"],
    count: ["休学学期数 The Number of Temporary Leave of Absence", "休学学期数", "The Number of Temporary Leave of Absence"],
  };
  const buttons = collect(document).filter(element => element.matches(".slds-accordion__summary-action"));
  const sections = new Map();
  const getSection = name => {
    if (sections.has(name)) return sections.get(name);
    const matches = buttons.filter(button => headings[name].some(label => key(text(button)) === key(label)));
    if (matches.length !== 1) return { error: "profile_section_not_found_or_ambiguous" };
    const button = matches[0];
    const content = button.closest("section")?.querySelector(".slds-accordion__content");
    if (!content) return { error: "profile_section_structure_changed" };
    if (button.getAttribute("aria-expanded") !== "true" || content.getAttribute("aria-hidden") === "true") return { error: "expand_requested_profile_section" };
    const result = { elements: collect(content) };
    sections.set(name, result);
    return result;
  };
  const valueAfterLabel = (item, label) => clean(Array.from(item.childNodes)
    .filter(node => node !== label && !(node.nodeType === 1 && node.contains(label)))
    .map(node => node.textContent ?? "").join(" "));
  const values = {}, unavailableFields = [], emptyFields = [], redactedFields = [];
  let truncated = false;
  for (const field of [...new Set(REQUEST.fields)]) {
    const sectionName = ["temporaryLeave", "studyAbroad"].includes(field) ? "history" : field === "leaveSemesters" ? "count" : "general";
    const section = getSection(sectionName);
    if (section.error) return fail(section.error);
    const matches = section.elements.filter(element => element.tagName === "STRONG" &&
      element.parentElement?.tagName === "LI" && labels[field].some(label => key(text(element)) === key(label)));
    if (matches.length !== 1) { unavailableFields.push(field); continue; }
    const label = matches[0], item = label.parentElement;
    const value = valueAfterLabel(item, label);
    if (["temporaryLeave", "studyAbroad"].includes(field)) {
      const list = item.parentElement;
      if (list?.tagName !== "UL") return fail("history_list_structure_changed");
      const siblings = Array.from(list.children).filter(element => element !== item);
      if (siblings.some(element => element.tagName !== "LI" || element.querySelector("strong"))) return fail("history_list_structure_changed");
      const entries = [value, ...siblings.map(text)].filter(Boolean);
      values[field] = { label: text(label), displayedEntries: entries.slice(0, REQUEST.limit),
        entriesDisplayed: entries.length > 0, emptyDisplay: entries.length === 0 };
      truncated ||= entries.length > REQUEST.limit;
      if (!entries.length) emptyFields.push(field);
    } else if (!value) {
      emptyFields.push(field);
    } else if (field === "name" || field === "studentNumber") {
      // Identifiers never reach the model as raw strings, even if Hatch setup was skipped.
      values[field] = { placeholder: field === "name" ? "{{FULL_NAME}}" : "{{STUDENT_NUMBER}}", displayed: true };
      redactedFields.push(field);
    } else {
      values[field] = value;
    }
  }
  return JSON.stringify({ kind: "student-profile", fields: [...new Set(REQUEST.fields)], values,
    unavailableFields, emptyFields, redactedFields, truncated });
})()
