#!/usr/bin/env python3
"""Validate every pack in packs/ and keep pack.lock and catalog.json up to date.

    python tools/validate.py            # check only (CI)
    python tools/validate.py --write    # also rewrite pack.lock files and catalog.json

Checks: JSON Schema (pack.yaml, hatch.yaml), folder name = pack id, referenced skills / MCP servers exist,
SKILL.md front matter, Hatch references (variables, conditions, prefills, USER.md template), a secret scan,
and that pack.lock and catalog.json match the files.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent.parent
PACKS = ROOT / "packs"
SCHEMA = ROOT / "schema"
CATALOG = ROOT / "catalog.json"
USER_MEMORY_LIMIT = 3000  # memory.user_char_limit that Tomo writes into Hermes' config
HATCH_SHARE = 0.6         # Hatch may use at most 60 %; the rest is for what the agent learns later
LOCK_EXCLUDE = {"pack.lock"}
LOCK_EXCLUDE_DIRS = {"data/build", "__pycache__", ".venv"}
TEXT_SUFFIXES = {".md", ".yaml", ".yml", ".json", ".py", ".txt", ".toml", ".js", ".ts", ".sh"}

SECRET_PATTERNS = {
    "private key": re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    "API key": re.compile(r"\b(sk|gk|rk)-[A-Za-z0-9_-]{16,}"),
    "GitHub token": re.compile(r"\bgh[pousr]_[A-Za-z0-9]{30,}"),
    "AWS key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    "student number": re.compile(r"(?<![0-9A-Za-z])[0-9]{2}[AB][0-9]{4}(?![0-9A-Za-z])"),
    "password assignment": re.compile(r"(?i)\bpassword\s*[:=]\s*['\"][^'\"]{4,}['\"]"),
}


class Report:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def error(self, where: str, msg: str) -> None:
        self.errors.append(f"{where}: {msg}")

    def warn(self, where: str, msg: str) -> None:
        self.warnings.append(f"{where}: {msg}")


def load_yaml(path: Path, rep: Report):
    try:
        return yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001
        rep.error(str(path.relative_to(ROOT)), f"cannot parse YAML: {exc}")
        return None


def schema_check(data, schema_name: str, where: str, rep: Report) -> None:
    schema = json.loads((SCHEMA / schema_name).read_text(encoding="utf-8"))
    for err in sorted(Draft202012Validator(schema).iter_errors(data), key=lambda e: list(e.path)):
        path = "/".join(str(p) for p in err.path) or "(root)"
        rep.error(where, f"{path}: {err.message}")


def front_matter(path: Path) -> dict | None:
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    return yaml.safe_load(m.group(1)) if m else None


def check_skills(pack_dir: Path, manifest: dict, rep: Report) -> None:
    where = f"packs/{pack_dir.name}"
    for name in manifest.get("skills") or []:
        skill_md = pack_dir / "skills" / name / "SKILL.md"
        if not skill_md.exists():
            rep.error(where, f"skill '{name}' is listed but skills/{name}/SKILL.md is missing")
            continue
        fm = front_matter(skill_md)
        if not fm:
            rep.error(f"{where}/skills/{name}", "SKILL.md has no YAML front matter")
            continue
        if fm.get("name") != name:
            rep.error(f"{where}/skills/{name}", f"front matter name '{fm.get('name')}' must equal the folder name")
        if not fm.get("description"):
            rep.error(f"{where}/skills/{name}", "front matter needs a description")
        if "version" not in fm:
            rep.warn(f"{where}/skills/{name}", "front matter has no version")
        # Tomo shows metadata.tomo.title / summary in the pack details; Hermes ignores them.
        tomo_meta = (fm.get("metadata") or {}).get("tomo") or {}
        for key in ("title", "summary"):
            text = tomo_meta.get(key)
            if not isinstance(text, dict) or any(not text.get(lang) for lang in ("en", "zh", "ja")):
                rep.error(f"{where}/skills/{name}", f"metadata.tomo.{key} needs en, zh and ja")
    listed = set(manifest.get("skills") or [])
    ui = manifest.get("ui") or {}
    for kind, items in (("quick_topics", ui.get("quick_topics")), ("quick_ask_suggestions", ui.get("quick_ask_suggestions"))):
        for i, item in enumerate(items or []):
            if isinstance(item, dict) and item.get("skill") not in listed:
                rep.error(where, f"ui.{kind}[{i}] points to skill '{item.get('skill')}', which is not in skills")
    on_disk = {p.name for p in (pack_dir / "skills").iterdir() if p.is_dir()} if (pack_dir / "skills").exists() else set()
    for extra in sorted(on_disk - set(manifest.get("skills") or [])):
        rep.warn(where, f"skills/{extra} exists but is not listed in pack.yaml")


def check_personal(manifest: dict, hatch: dict | None, where: str, rep: Report) -> None:
    """personal_origins must be browser origins; personal_consent must name a choice question and its options."""
    perm = manifest.get("permissions") or {}
    origins = set(perm.get("browser_origins") or [])
    for host in perm.get("personal_origins") or []:
        if host not in origins:
            rep.error(where, f"personal_origins: {host} is not in browser_origins")
    consent = perm.get("personal_consent")
    if not consent:
        return
    question = next((q for q in (hatch or {}).get("questions") or [] if q.get("id") == consent.get("question")), None)
    if question is None:
        rep.error(where, f"personal_consent: Hatch has no question '{consent.get('question')}'")
        return
    values = {o.get("value") for o in question.get("options") or []}
    for v in consent.get("refuse") or []:
        if v not in values:
            rep.error(where, f"personal_consent: '{v}' is not an option of '{consent.get('question')}'")


def check_mcp(pack_dir: Path, manifest: dict, rep: Report) -> None:
    for name in (manifest.get("mcp") or {}):
        if not (pack_dir / "mcp" / name).is_dir():
            rep.error(f"packs/{pack_dir.name}", f"MCP server '{name}' is listed but mcp/{name}/ is missing")


def check_hatch(pack_dir: Path, hatch: dict, rep: Report) -> None:
    where = f"packs/{pack_dir.name}/hatch.yaml"
    questions = hatch.get("questions") or []
    ids = [q.get("id") for q in questions]
    for dup in {i for i in ids if ids.count(i) > 1}:
        rep.error(where, f"question id '{dup}' is used twice")
    variables = [q["variable"] for q in questions if "variable" in q]
    for dup in {v for v in variables if variables.count(v) > 1}:
        rep.error(where, f"variable '{dup}' is used twice")
    known = set(ids)
    for q in questions:
        qid = q.get("id")
        for key in ("validate",):
            if key in q:
                try:
                    re.compile(q[key])
                except re.error as exc:
                    rep.error(where, f"{qid}.{key}: invalid regex ({exc})")
        conds = [("when", q["when"])] if "when" in q else []
        conds += [(f"options[{o.get('value')}].when", o["when"]) for o in q.get("options") or [] if "when" in o]
        for label, cond in conds:
            m = re.match(r"^\s*([a-z][a-z0-9_]*)\s*(==|!=|>=|<=|>|<)\s*\S+\s*$", cond)
            if not m:
                rep.error(where, f"{qid}.{label}: use the form 'question op value' (got '{cond}')")
            elif m.group(1) not in known:
                rep.error(where, f"{qid}.{label} refers to unknown question '{m.group(1)}'")
        pf = q.get("prefill_from")
        if pf:
            if pf["question"] not in known:
                rep.error(where, f"{qid}.prefill_from refers to unknown question '{pf['question']}'")
            try:
                if re.compile(pf["regex"]).groups < pf["group"]:
                    rep.error(where, f"{qid}.prefill_from.group {pf['group']} does not exist in the regex")
            except re.error as exc:
                rep.error(where, f"{qid}.prefill_from.regex: invalid regex ({exc})")
            if ids.index(pf["question"]) > ids.index(qid):
                rep.error(where, f"{qid} is prefilled from a later question ('{pf['question']}')")
    sections = [sec.get("id") for sec in hatch.get("sections") or []]
    for q in questions:
        if q.get("section") not in sections:
            rep.error(where, f"{q.get('id')}: section '{q.get('section')}' is not defined in sections")
        if q.get("type") == "multi" and q.get("max_select") and q["max_select"] > len(q.get("options") or []) + (1 if q.get("allow_other") else 0):
            rep.error(where, f"{q.get('id')}.max_select is larger than the number of options")
    for sec in sections:
        if not any(q.get("section") == sec and q.get("ask") == "setup" for q in questions):
            rep.warn(where, f"section '{sec}' has no first-run questions and will be empty during setup")
    # USER.md lines: one per answered question
    estimate = 0
    for q in questions:
        line = q.get("remember")
        if not line:
            rep.warn(where, f"{q.get('id')}: no 'remember' line, the answer will not reach USER.md")
            continue
        for ref in re.findall(r"\{\{([A-Z][A-Z0-9_]*)\}\}", line):
            if ref not in variables:
                rep.error(where, f"{q.get('id')}.remember refers to unknown variable '{{{{{ref}}}}}'")
        bare = re.sub(r"\{\{[A-Z0-9_]+\}\}", "", line)
        for ref in re.findall(r"\{([a-z_]+)\}", bare):
            if ref != "answer":
                rep.error(where, f"{q.get('id')}.remember: only {{answer}} and {{{{VARIABLES}}}} are allowed, found '{{{ref}}}'")
        if q.get("type") in ("identifier", "login") and "{answer}" in bare:
            rep.error(where, f"{q.get('id')}.remember inserts the real value of an identifier; use {{{{{q.get('variable')}}}}}")
        if q.get("type") not in ("identifier", "login") and "{answer}" not in bare:
            rep.warn(where, f"{q.get('id')}.remember does not include {{answer}}")
        long_answer = 300 if q.get("type") == "longtext" else 40
        estimate += len(bare.replace("{answer}", "")) + (long_answer if "{answer}" in bare else 0) + 3  # "\n§\n"
    budget = int(USER_MEMORY_LIMIT * HATCH_SHARE)
    if estimate > budget:
        rep.error(where, f"Hatch fills about {estimate} characters of USER.md when every question is answered; the budget is {budget} of {USER_MEMORY_LIMIT}")
    else:
        print(f"info     {where}: Hatch fills about {estimate} of its {budget}-character USER.md budget")


def secret_scan(pack_dir: Path, rep: Report) -> None:
    for path in sorted(pack_dir.rglob("*")):
        if not path.is_file() or path.suffix not in TEXT_SUFFIXES or path.name == "pack.lock":
            continue
        rel = path.relative_to(ROOT)
        for lineno, line in enumerate(path.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
            for label, pat in SECRET_PATTERNS.items():
                if pat.search(line):
                    rep.error(f"{rel}:{lineno}", f"looks like a {label}; packs must never contain real personal data or secrets")


def lock_for(pack_dir: Path, version: str) -> dict:
    files = {}
    for path in sorted(pack_dir.rglob("*")):
        rel = path.relative_to(pack_dir).as_posix()
        if not path.is_file() or path.name in LOCK_EXCLUDE or path.name == ".DS_Store":
            continue
        if any(rel == d or rel.startswith(d + "/") or f"/{d}/" in f"/{rel}" for d in LOCK_EXCLUDE_DIRS):
            continue
        files[rel] = hashlib.sha256(path.read_bytes()).hexdigest()
    return {"pack": pack_dir.name, "version": version, "files": files}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--write", action="store_true", help="rewrite pack.lock files and catalog.json")
    args = ap.parse_args()
    rep = Report()
    catalog = []

    for pack_dir in sorted(p for p in PACKS.iterdir() if p.is_dir()):
        where = f"packs/{pack_dir.name}"
        manifest_path, hatch_path = pack_dir / "pack.yaml", pack_dir / "hatch.yaml"
        if not manifest_path.exists():
            rep.error(where, "pack.yaml is missing")
            continue
        manifest = load_yaml(manifest_path, rep)
        if manifest is None:
            continue
        schema_check(manifest, "pack.schema.json", f"{where}/pack.yaml", rep)
        if manifest.get("id") != pack_dir.name:
            rep.error(f"{where}/pack.yaml", f"id '{manifest.get('id')}' must equal the folder name '{pack_dir.name}'")
        if not (pack_dir / "soul.md").exists():
            rep.error(where, "soul.md is missing")
        if hatch_path.exists():
            hatch = load_yaml(hatch_path, rep)
            if hatch is not None:
                schema_check(hatch, "hatch.schema.json", f"{where}/hatch.yaml", rep)
                check_hatch(pack_dir, hatch, rep)
        else:
            rep.error(where, "hatch.yaml is missing")
        check_personal(manifest, hatch if hatch_path.exists() else None, f"{where}/pack.yaml", rep)
        check_skills(pack_dir, manifest, rep)
        check_mcp(pack_dir, manifest, rep)
        secret_scan(pack_dir, rep)

        lock = lock_for(pack_dir, str(manifest.get("version")))
        lock_path = pack_dir / "pack.lock"
        if args.write:
            lock_path.write_text(json.dumps(lock, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        elif not lock_path.exists() or json.loads(lock_path.read_text(encoding="utf-8")) != lock:
            rep.error(where, "pack.lock is missing or out of date; run: python tools/validate.py --write")
        digest = hashlib.sha256(json.dumps(lock, sort_keys=True).encode()).hexdigest()
        catalog.append({
            "id": manifest.get("id"),
            "name": manifest.get("name"),
            "school": (manifest.get("school") or {}).get("name"),
            "short": (manifest.get("school") or {}).get("short"),
            "domain": (manifest.get("school") or {}).get("domain"),
            "version": manifest.get("version"),
            "requires": manifest.get("requires"),
            "publisher": manifest.get("publisher"),
            "lock_sha256": digest,
        })

    catalog_doc = {"schema": 1, "packs": catalog}
    if args.write:
        CATALOG.write_text(json.dumps(catalog_doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    elif not CATALOG.exists() or json.loads(CATALOG.read_text(encoding="utf-8")) != catalog_doc:
        rep.error("catalog.json", "missing or out of date; run: python tools/validate.py --write")

    for w in rep.warnings:
        print(f"warning  {w}")
    for e in rep.errors:
        print(f"ERROR    {e}")
    print(f"{len(catalog)} pack(s), {len(rep.errors)} error(s), {len(rep.warnings)} warning(s)")
    return 1 if rep.errors else 0


if __name__ == "__main__":
    sys.exit(main())
