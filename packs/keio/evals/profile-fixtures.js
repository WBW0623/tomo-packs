(source => {
  // Synthetic DOM only; the marker strings below are fictional and never identify a real account.
  const section = (title, body, expanded = true) => '<section><button class="slds-accordion__summary-action" aria-expanded="' + expanded + '">' +
    title + '</button><div class="slds-accordion__content" aria-hidden="' + !expanded + '"><profile-fields>' + body + '</profile-fields></div></section>';
  const general = '<ul><li><strong>学籍番号 Student ID Number：</strong><span>FICTIONAL_ID</span></li>' +
    '<li><strong>氏名 Name：</strong><span>FICTIONAL_NAME</span></li>' +
    '<li><strong>課程 Program：</strong><span>Fictional Program</span></li>' +
    '<li><strong>学部・研究科 Affiliation：</strong><span>Fictional Faculty</span></li>' +
    '<li><strong>学科・専攻 Department/Major：</strong><span>Fictional Major</span></li>' +
    '<li><strong>学年 Year Level：</strong><span>1</span></li>' +
    '<li><strong>クラス Class：</strong><span>Fictional Class</span></li></ul>';
  const history = '<ul><li><strong>休学 Temporary Leave of Absence：</strong><span>Fictional leave period A</span></li>' +
    '<li>Fictional leave period B</li></ul><ul><li><strong>留学 Study Abroad：</strong></li></ul>';
  const count = '<ul><li><strong>現在の休学学期数:</strong><span>1</span></li><li><span>Fictional explanatory number 9</span></li></ul>';
  const bank = '<ul><li><strong>氏名 Name：</strong><span>FICTIONAL_BANK_VALUE</span></li></ul>';
  const markup = (generalOpen = true, generalBody = general) => section('全般 General', generalBody, generalOpen) +
    section('休学・留学歴 History of Temporary Leave of Absence / Study Abroad', history) +
    section('休学学期数 The Number of Temporary Leave of Absence', count) + section("学生本人銀行口座情報 Student's Own Bank Account Information", bank);
  const read = (fields, options = {}) => {
    const document = new DOMParser().parseFromString('<profile-root>' + markup(options.open ?? true, options.general ?? general) + '</profile-root>', 'text/html');
    // Exercise native shadow roots and assigned slots, including a nested shadow root.
    for (const host of document.querySelectorAll('profile-root,profile-fields')) host.attachShadow({ mode: 'open' }).innerHTML = '<div><slot></slot></div>';
    const request = { fields, limit: options.limit ?? 100 };
    const expression = source.replace(/const REQUEST = \{[^\r\n]*\};/, 'const REQUEST = ' + JSON.stringify(request) + ';');
    return JSON.parse(Function('document', 'location', 'return (' + expression + ');')(document,
      { origin: options.origin ?? 'https://keiouniversity.my.site.com', pathname: options.path ?? '/students/s/MyPage' }));
  };
  const checks = [];
  const check = (name, value) => { if (!value) throw new Error('Synthetic profile check failed: ' + name); checks.push(name); };
  let result = read(['program', 'affiliation', 'department', 'yearLevel', 'class', 'name', 'studentNumber', 'temporaryLeave', 'studyAbroad', 'leaveSemesters']);
  check('all requested fields found through nested shadow roots and slots without duplication', result.unavailableFields.length === 0 && Object.keys(result.values).length === 10);
  check('identifiers are placeholder objects even without Hatch mapping', result.values.name.placeholder === '{{FULL_NAME}}' &&
    result.values.studentNumber.placeholder === '{{STUDENT_NUMBER}}' && !JSON.stringify(result).includes('FICTIONAL_NAME') && !JSON.stringify(result).includes('FICTIONAL_ID'));
  check('banking section is excluded despite overlapping labels', !JSON.stringify(result).includes('FICTIONAL_BANK_VALUE'));
  check('leave semester value comes from its labelled item rather than explanatory numbers', result.values.leaveSemesters === '1');
  check('blank history stays an empty display without inventing a record', result.values.studyAbroad.emptyDisplay === true && result.values.studyAbroad.displayedEntries.length === 0);
  result = read(['temporaryLeave'], { limit: 1 });
  check('history limit is explicit and unrelated fields excluded', result.truncated === true && result.values.temporaryLeave.displayedEntries.length === 1 && Object.keys(result.values).length === 1);
  result = read(['program'], { open: false });
  check('collapsed requested section stops reading', result.error === 'expand_requested_profile_section');
  result = read(['bankAccount']);
  check('unapproved fields rejected', result.error === 'invalid_profile_fields');
  result = read(['program'], { origin: 'https://example.invalid' });
  check('unapproved origin rejected', result.error === 'open_my_page');
  result = read(['yearLevel'], { general: '<ul><li><strong>Unknown Label</strong><span>1</span></li></ul>' });
  check('unknown field labels are unavailable rather than guessed', result.unavailableFields.includes('yearLevel') && !Object.hasOwn(result.values, 'yearLevel'));
  return JSON.stringify({ passed: checks.length, checks });
})
