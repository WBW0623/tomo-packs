# Per-course attendance: source discovery and limits

A registered-course list, timetable, GPA, or final grade does not establish attendance. Reading an existing
record is different from performing an attendance check-in.

## Entry points and procedure

1. Open K-Support's `K-LMS：学修支援システム（Canvas LMS）` (`https://lms.keio.jp/`). In Canvas, `コース` →
   `すべてのコース` opens `/courses`, with separate current/past enrollment tables. The dashboard is not a
   complete course list, and Canvas communities need not be officially registered courses.
   Match the requested course, term, and offering before proceeding. Done when the source course is identified.
2. Inspect the course's visible navigation for a read-only attendance-history tool or an existing student
   grade/results view. Course menus vary; do not invent a universal attendance URL. The inspected grade-view
   route is `/courses/{course}/grades`. Opening course homes and existing student grade views is allowed.
   Do not click attendance check-in links, quiz titles, attempt/start/retake buttons, submission controls,
   what-if score controls, or tools whose opening itself registers attendance.
   Done when a read-only record view is found or no such view is exposed.
3. Inspect only headers, legends, filters, and coverage before extracting requested dates/statuses through
   `browser_console` and Tomo's consent flow. Never enumerate classmates or read teacher-facing management
   screens. Done when a student's own record schema is verified, or the unreadable layout is stated.
4. Distinguish attendance marks from attendance-related assessments: quiz submission, score, a missing grade,
   or Canvas activity does not by itself mean present, absent, or late. Do not convert these into absence totals
   or import another school's absence thresholds. Done when the answer accurately identifies its evidence.
5. If the student sees a record that cannot be found, ask for its course/menu entry or have them leave the
   visible browser on that record. Do not request screenshots or exports containing personal data.

When no read-only result is found, say "I could not find a readable attendance record for this course" rather
than "you have no absences". The student or instructor may use another tool or private record.

## Official guidance

The [official student guide](https://www.itc.keio.ac.jp/ja/klms_canvas_student.html) distinguishes the dashboard
from all courses. The [basic-functions guide](https://www.itc.keio.ac.jp/ja/klms_canvas_student_basic.html)
describes quiz-based attendance checks and notes that some quiz configurations immediately show questions
after clicking their title. Do not click an attendance quiz merely to discover whether a record exists.

## Embedded tools

Canvas's `時間割/ Timetable` and `Tools` are external-tool launches. Their numerical configuration IDs must
come from live navigation, not a hard-coded example. The timetable tool renders at
`https://tool.klms.keio.jp/ess-lti/timetable`; Tools renders at `/klms-lti/link` in an iframe. Its `src` attribute
can remain `about:blank` although the active document is at the tool origin. Directly opening the timetable
endpoint in a new tab produced an error; it is not a verified shortcut to the launched session.

Use available browser frame-selection controls to inspect a launched frame. If the runtime cannot target it,
explain that limitation. Do not copy hidden launch fields, signed requests, cookies, or tokens, or recreate LTI
authentication outside the browser. Do not press Tools favorite/settings controls.
The legacy `授業支援` link did not expose a working record page in this session and is not a verified source.

## Coverage status

Available current/past course menus, existing grade views where exposed, the timetable launch, and Tools were
inspected in the contributor's signed-in browser. No explicit attendance-history table or attendance-mark
legend was found. No quiz attempt was opened and no attendance was registered.

**Per-course attendance extraction remains unverified.** No fabricated attendance selector or absence-count
implementation is supplied. Locate and test a real read-only record before adding its schema and interpretation.
No course names, enrollments, grades, attendance records, or account-specific counts are saved here.
