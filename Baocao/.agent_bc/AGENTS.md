# Agent BC – Document & Report AI Agent

Project: Graduation Thesis – Mini-ERP for Aluminum & Glass Workshop Management.
Stack: Python, python-docx, lxml.
Domain: Vietnamese academic thesis/report formatting & auditing.

## Core Safety Rules (MUST FOLLOW)

- DO NOT modify the original .docx without creating a timestamped backup first.
- DO NOT run `standardize_bibliography.py` without `--dry-run` first to preview changes.
- DO NOT overwrite backup files. Each backup must have a unique timestamp.
- DO NOT delete or merge reference items that have no mapping – report them as errors.
- DO NOT assume citation indices. Always parse dynamically from the document.
- DO NOT hardcode reference lists or citation mappings in scripts.
- DO NOT strip run-level formatting (bold, italic, font, size) when editing paragraphs.
- DO NOT modify paragraphs outside the target section scope.
- Agent MUST NOT self-declare final pass. User confirms final pass.

## Common Commands

```bash
# Full audit (recommended first step)
python .agent_bc/scripts/audit_doc_integrity.py --path "path/to/doc.docx"

# Structure validation
python .agent_bc/scripts/validate_structure.py --path "path/to/doc.docx"

# Cross-reference validation
python .agent_bc/scripts/validate_cross_references.py --path "path/to/doc.docx"

# Preview bibliography changes (safe, no modification)
python .agent_bc/scripts/standardize_bibliography.py --path "path/to/doc.docx" --dry-run

# Apply bibliography sorting
python .agent_bc/scripts/standardize_bibliography.py --path "path/to/doc.docx"

# Heal spacing issues
python .agent_bc/scripts/fix_spacing_and_breaks.py --path "path/to/doc.docx"
```

## Default Workflow & Skill Map

- Every task must follow `doc-safety-rules`: backup before modify, dry-run before apply.
- Every task starts with **Audit** (`audit_doc_integrity.py`) to identify issues.
- If thesis structure check is needed, use `doc-structure-validator` / `validate_structure.py`.
- If figure/table cross-reference check is needed, use `doc-cross-reference-audit` / `validate_cross_references.py`.
- If word-stretching (soft breaks) is detected, use `doc-spacing-self-healing` / `fix_spacing_and_breaks.py`.
- If bibliography needs re-sorting, use `doc-citation-plagiarism-audit` / `standardize_bibliography.py`.
- If format rules (font, heading, caption) need checking, refer to `doc-formatting-standard`.
- After any fix, re-run **Audit** to confirm all issues resolved.
- See `workflows/doc-processing-cycle.md` for the full processing workflow.

## Resource Optimization Rules

- DO NOT read the entire .docx paragraph by paragraph in reports. Summarize findings.
- DO NOT load all skills by default. Only load the relevant skill for the current task.
- DO NOT repeat audit/validation if no changes were made between runs.
- DO NOT paste full script outputs in responses. Keep responses short and technical.
- If scope expands beyond the original task, stop and ask for approval.
