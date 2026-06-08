---
name: doc-cross-reference-audit
description: Validates cross-references between in-text mentions (Hình X.Y, Bảng X.Y) and actual figure/table captions in the document.
version: 1.0.0
domain: academic_writing
updated: 2026-06-03
author: Agent_BC
---

# Cross-Reference Audit (doc-cross-reference-audit)

This skill validates that all in-text references to figures and tables match actual captions in the document, and vice versa.

## 1. Cross-Reference Types

| Pattern | Description | Example |
|---------|-------------|---------|
| `Hình X.Y` | Figure reference | `Hình 3.1`, `Hình 7.12` |
| `Bảng X.Y` | Table reference | `Bảng 2.3`, `Bảng 5.1` |

## 2. Validation Rules

### Phantom References (cited but no caption exists)
*   Every `Hình X.Y` mentioned in body text must have a matching caption paragraph starting with `Hình X.Y`.
*   Every `Bảng X.Y` mentioned in body text must have a matching caption paragraph starting with `Bảng X.Y`.
*   These are **errors** — the reader sees a reference to a non-existent figure/table.

### Orphan Captions (caption exists but never referenced)
*   Every caption `Hình X.Y` should be referenced at least once in the body text.
*   Every caption `Bảng X.Y` should be referenced at least once in the body text.
*   These are **warnings** — a figure/table exists but is never discussed.

### Sequential Numbering
*   Within each chapter, figures must be numbered sequentially: `Hình 3.1`, `Hình 3.2`, `Hình 3.3`, ...
*   Within each chapter, tables must be numbered sequentially: `Bảng 2.1`, `Bảng 2.2`, `Bảng 2.3`, ...
*   Gaps in numbering are **warnings** (may indicate a deleted figure/table).

## 3. Scope
*   Scan body paragraphs and table cells for in-text references.
*   Scan all paragraphs for caption labels.
*   Exclude TOC/list-of-figures/list-of-tables sections (auto-generated content).

## 4. Related Scripts
*   **[validate_cross_references.py](file:///d:/MiniERP_NhomKinh/.agent_bc/scripts/validate_cross_references.py)**: Automated cross-reference validation.
*   **[audit_doc_integrity.py](file:///d:/MiniERP_NhomKinh/.agent_bc/scripts/audit_doc_integrity.py)**: General integrity audit (includes caption bold check).
