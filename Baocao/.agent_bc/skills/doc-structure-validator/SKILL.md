---
name: doc-structure-validator
description: Validates Vietnamese thesis/report structure completeness – required sections, correct order, chapter numbering, and heading hierarchy.
version: 1.0.0
domain: academic_writing
updated: 2026-06-03
author: Agent_BC
---

# Document Structure Validator (doc-structure-validator)

This skill validates that a Vietnamese thesis/report document has all required sections in the correct order and with proper heading hierarchy.

## 1. Required Sections (Vietnamese Thesis Standard)

A standard Vietnamese graduation thesis must contain the following sections **in this order**:

| # | Section | Heading Level | Required? |
|---|---------|---------------|-----------|
| 1 | Cover page | — | ✓ |
| 2 | Academic integrity pledge (Lời cam đoan) | Heading 1 | ✓ |
| 3 | Acknowledgments (Lời cảm ơn) | Heading 1 | ✓ |
| 4 | Abstract (Tóm tắt chuyên đề) | Heading 1 | ✓ |
| 5 | Table of Contents (Mục lục) | Heading 1 | ✓ |
| 6 | List of Figures (Danh mục hình vẽ) | Heading 1 | ✓ |
| 7 | List of Tables (Danh mục bảng biểu) | Heading 1 | ✓ |
| 8 | List of Abbreviations (Danh mục ký hiệu) | Heading 1 | Optional |
| 9 | Introduction (Phần mở đầu) | Heading 1 | ✓ |
| 10 | Body Chapters 1–N | Heading 1 | ✓ |
| 11 | Conclusion & Future Work (Kết luận) | Heading 1 | ✓ |
| 12 | References (Danh mục tài liệu tham khảo) | Heading 1 | ✓ |
| 13 | Appendix (Phụ lục) | Heading 1 | Optional |

## 2. Chapter Numbering Rules
*   Body chapters must be numbered sequentially starting from 1.
*   Sub-sections follow `X.Y` (Heading 2) and `X.Y.Z` (Heading 3) format.
*   No heading level should be skipped (e.g., Heading 1 → Heading 3 without Heading 2 is an error).

## 3. Heading Hierarchy Checks
*   Every Heading 1 chapter must have at least one child Heading 2 (except short sections like acknowledgments).
*   Heading numbering must be sequential within each chapter.
*   No empty headings (headings with blank text).

## 4. Related Scripts
*   **[validate_structure.py](file:///d:/MiniERP_NhomKinh/.agent_bc/scripts/validate_structure.py)**: Automated structure validation script.
*   **[audit_doc_integrity.py](file:///d:/MiniERP_NhomKinh/.agent_bc/scripts/audit_doc_integrity.py)**: General integrity audit.
