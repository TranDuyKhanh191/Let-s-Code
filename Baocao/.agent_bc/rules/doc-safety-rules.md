---
trigger: manual
description: Safety rules for Agent BC – document modification, backup, and data integrity.
---

# Agent BC Safety Rules

## 1. Backup Before Modify
- Every script that modifies a .docx file MUST create a backup before writing.
- Backups MUST include a unique timestamp in the filename: `_Backup_YYYYMMDD_HHMMSS.docx`.
- NEVER overwrite existing backup files.
- If a script detects no changes are needed, delete the newly created backup and report "No changes needed".

## 2. Dry-Run First
- `standardize_bibliography.py` MUST be run with `--dry-run` before actual execution.
- During dry-run, display the full `[old] → [new]` mapping for user confirmation.
- If the mapping is identity (all `[N] → [N]`), DO NOT modify the file. Report "Already sorted".

## 3. Formatting Preservation
- When splitting paragraphs (fix spacing), MUST deep-copy `<w:rPr>` (run properties) to preserve bold, italic, font name, font size, color, underline, superscript/subscript.
- When rewriting references, MUST deep-copy the original `<w:p>` XML and only update the index number `[N]`.
- NEVER create plain runs (`add_run(text)`) as a replacement for formatted runs.

## 4. Citation Safety
- NEVER hardcode `{old: new}` mappings in code. Always parse dynamically from the document.
- MUST use two-pass replacement (`old → §CITE_temp§ → new`) to prevent double-mapping.
- MUST filter `[N]` patterns: only replace when `N` exists in the mapping. Do not replace dimension arrays like `[3000, 2500]` or numbers outside the mapping range.

## 5. Scope Control
- Scripts must only modify content within their target scope:
  - `standardize_bibliography.py`: Only modifies citations in body text + reference list section.
  - `fix_spacing_and_breaks.py`: Only modifies justified paragraphs containing soft breaks.
- DO NOT modify headings, TOC, cover page, or any content outside the target scope.

## 6. Idempotent Requirement
- Running any script on an already-correct document MUST produce zero changes.
- Running audit after a fix MUST return "PASS" if the fix was successful.
