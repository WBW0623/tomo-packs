# Contributing

1. Fork, then create or edit `packs/<id>/`. Start from an existing pack.
2. Keep every user-facing text in English, Chinese and Japanese.
3. Never commit personal data (names, student numbers, grades), credentials or downloaded databases. Use
   placeholders (`{{STUDENT_NUMBER}}`) and build scripts.
4. Run `python tools/validate.py --write` and commit the updated `pack.lock` and `catalog.json`.
5. Open a pull request. The checks must pass and a repository owner must approve.
   The pack's `publisher` in `pack.yaml` is shown to students in Tomo.

Breaking Hatch changes bump `hatch.yaml` → `version`; Tomo then offers "Redo Hatch" to existing users.
