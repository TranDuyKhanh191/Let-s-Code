---
name: doc-formatting-standard
description: Formatting standards for document body, headings, figures, tables, and code snippets following Vietnamese academic requirements.
version: 2.0.0
domain: technical_writing
updated: 2026-06-03
author: Agent_BC
---

# Formatting & Styling Standard (doc-formatting-standard)

This skill defines the specification and instructions for styling elements in Word documents to meet Vietnamese academic and corporate standards.

## 1. General Body Text
*   **Font**: `Times New Roman`, size `13pt`.
*   **Line Spacing**: `1.5` lines.
*   **Alignment**: Justified (`JUSTIFY`), ensuring clean left and right margins.
*   **Paragraph Spacing**: `Space After = 6pt` or `0pt` depending on template context; no double carriage returns (`\n\n`) within single text runs.
*   **Margins**: Top = 2cm, Bottom = 2cm, Left = 3cm, Right = 2cm (standard Vietnamese thesis format).

## 2. Heading Configurations
*   **Heading 1**: Size `14–16pt`, bold, uppercase, page break before.
*   **Heading 2**: Size `13–14pt`, bold, sentence case.
*   **Heading 3**: Size `13pt`, bold or bold-italic, sentence case.
*   **Style Application**: Must use actual MS Word Heading styles (e.g. `Heading 1`, `Heading 2`) to ensure they are captured by the Table of Contents (TOC) auto-builder.

## 3. Figure & Table Captions
*   **Label Style**: Non-bold (normal weight), font size `11pt` or `12pt`.
*   **Alignment**: Centered (`CENTER`).
*   **Placement**:
    *   **Figures / Charts / Images**: Caption placed **below** the figure.
    *   **Tables**: Caption placed **above** the table.
*   **Naming Convention**: Numbered sequentially per chapter (e.g. `Hình 7.1`, `Bảng 2.3`).

## 4. Code Blocks & Table Layouts
*   **Font**: Monospaced font like `Consolas`, size `9.5pt` or `10pt`.
*   **Alignment**: Left-aligned (`LEFT`).
*   **Line Spacing**: `1.0` (single line spacing).
*   **Padding**: Cell margins (top/bottom/left/right) set to minimal size (e.g. `4pt`).
*   **Layout**: Always use border grids rather than tab characters for consistent cross-platform rendering.

## 5. Related Scripts
*   **[audit_doc_integrity.py](file:///d:/MiniERP_NhomKinh/.agent_bc/scripts/audit_doc_integrity.py)**: Audits caption formatting (non-bold check) and heading structure.
*   **[fix_spacing_and_breaks.py](file:///d:/MiniERP_NhomKinh/.agent_bc/scripts/fix_spacing_and_breaks.py)**: Heals spacing issues while preserving run-level formatting.
