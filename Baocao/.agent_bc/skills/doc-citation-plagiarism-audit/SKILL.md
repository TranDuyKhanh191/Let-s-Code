---
name: doc-citation-plagiarism-audit
description: Dynamic citation management, bibliography sorting (Vietnamese & English), in-text citation propagation, and document integrity/plagiarism auditing.
version: 2.0.0
domain: academic_writing
updated: 2026-06-03
author: Agent_BC
---

# Citation & Plagiarism Auditing (doc-citation-plagiarism-audit)

This skill describes how to structure a bibliography, sort it alphabetically according to regional standards, propagate citation changes through the body text, and run automated integrity checks.

## 1. Academic Bibliography Standards
*   **Structure**: Group references by language (`Tài liệu tiếng Việt` first, then `Tài liệu tiếng Anh và trực tuyến`).
*   **Format for Books/Theses**: `[Index] Author (Year), Title (italics), Publisher.`
    *   *Example*: `[1] Nguyễn Văn Ba (2006), Phân tích và thiết kế hệ thống thông tin, NXB Đại học Quốc gia Hà Nội.`
*   **Format for Papers/Articles**: `[Index] Author (Year), Title (italics), Journal, Volume, Issue, Pages.`
    *   *Example*: `[8] Gilmore, P. C. and Gomory, R. E. (1961), A Linear Programming Approach to the Cutting Stock Problem, Operations Research, Vol. 9, No. 6, pp. 849–859.`
*   **Paragraph Properties**: Style = `reference-item`, `Hanging Indent = 0.3"`, `Space After = 6pt`, `Line Spacing = 1.5`, Alignment = `JUSTIFY`.

---

## 2. Alphabetical Sorting Standards

### Vietnamese Authors
*   Sort alphabetically by the **given name** (last word of the author's full name).
*   Use standard Vietnamese alphabet collation order: A Ă Â B C D Đ E Ê G H I K L M N O Ô Ơ P Q R S T U Ư V X Y.
*   *Example*: Nguyễn Văn **B**a → Đặng Văn **Đ**ức → Trần Hạnh **N**hi → Nguyễn **T**uệ

### Foreign/Corporate Authors
*   Sort alphabetically by the **surname** of the first author or the first word of the corporate/organization name.
*   *Example order*: Chen → Express.js → Gilmore → Google → Lodi → Microsoft → OpenAI → Oracle → PostgreSQL → React → SAP → Supabase → Tailwind → TanStack → Vercel → Wäscher

---

## 3. Dynamic Citation Alignment & Propagation (v2)
The bibliography sorting script works **fully dynamically** – no hardcoded mappings:

1.  **Parse Phase**: Extract all existing references from the document by scanning paragraphs after the reference heading.
2.  **Sort Phase**: Sort Vietnamese and English groups independently using proper collation keys.
3.  **Map Phase**: Build `Old Index → New Index` mapping dynamically from original vs sorted order.
4.  **Idempotent Check**: If mapping is identity (all `[N] → [N]`), skip modification entirely.
5.  **Two-Pass Replace**: Use temporary markers (`§CITE_N§`) to prevent double-mapping:
    *   Pass 1: `[old]` → `§CITE_new§`
    *   Pass 2: `§CITE_new§` → `[new]`
6.  **Scope**: Scans all runs in all body paragraphs and table cells.
7.  **Safety**: Only replaces integers that exist in the mapping (≤100), preventing corruption of dimension arrays like `[3000, 2500]`.
8.  **Format Preservation**: Deep-copies original paragraph XML when rewriting references, preserving italic titles, fonts, and sizes.

---

## 4. Plagiarism & Integrity Audit Checklist (v2)
The audit script performs comprehensive checks:

1.  **Duplicate Check**: No reference numbers are duplicated.
2.  **Sequential Check**: Reference numbers are sequential `[1]` through `[N]`.
3.  **Orphan Detection**: No "orphan references" (listed but never cited in body).
4.  **Phantom Detection**: No "phantom citations" (cited in body but not in reference list).
5.  **Citation Coverage**: `Unique Citations in Body == All Bibliography Items`.
6.  **Placeholder Search**: Scan for draft flags (`TODO`, `FIXME`, `draft`, etc.) with false-positive filtering.
7.  **Caption Formatting**: Figure/table captions must be normal weight (non-bold).
8.  **Sort Verification**: Verify Vietnamese and English references are in correct alphabetical order.
9.  **TOC Configuration**: Check `w:updateFields` is enabled.
10. **Soft Break Preview**: Scan for justified paragraphs with soft line breaks.

---

## 5. Related Scripts
*   **[standardize_bibliography.py](file:///d:/MiniERP_NhomKinh/.agent_bc/scripts/standardize_bibliography.py)**: Dynamic sorting with `--dry-run` option.
*   **[audit_doc_integrity.py](file:///d:/MiniERP_NhomKinh/.agent_bc/scripts/audit_doc_integrity.py)**: Comprehensive integrity audit with `--strict` mode.
