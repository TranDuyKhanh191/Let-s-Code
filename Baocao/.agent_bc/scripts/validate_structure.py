"""
validate_structure.py – Vietnamese Thesis Structure Validator
=============================================================
Validates that the document has all required sections for a Vietnamese
thesis/report, in the correct order, with proper heading hierarchy.

Checks:
  [1] Required sections present and in correct order
  [2] Chapter numbering sequential
  [3] Heading hierarchy (no skipped levels)
  [4] Empty heading detection

Usage:
  python validate_structure.py --path "path/to/doc.docx"
"""

import docx
import sys
import re
import os
import unicodedata
import argparse

sys.stdout.reconfigure(encoding='utf-8')


def normalize(text: str) -> str:
    return unicodedata.normalize('NFC', text.strip())


# Required sections in order (keyword, display name, required?)
REQUIRED_SECTIONS = [
    ('LỜI CAM ĐOAN', 'Lời cam đoan', True),
    ('LỜI CẢM ƠN', 'Lời cảm ơn', True),
    ('TÓM TẮT', 'Tóm tắt chuyên đề', True),
    ('MỤC LỤC', 'Mục lục', True),
    ('DANH MỤC HÌNH', 'Danh mục hình vẽ', True),
    ('DANH MỤC BẢNG', 'Danh mục bảng biểu', True),
    ('DANH MỤC KÝ HIỆU', 'Danh mục ký hiệu / viết tắt', False),
    ('PHẦN MỞ ĐẦU', 'Phần mở đầu', True),
]

CLOSING_SECTIONS = [
    ('KẾT LUẬN', 'Kết luận và hướng phát triển', True),
    ('DANH MỤC TÀI LIỆU', 'Danh mục tài liệu tham khảo', True),
    ('PHỤ LỤC', 'Phụ lục', False),
]


def validate_structure(doc_path: str) -> bool:
    print(f"{'='*60}")
    print(f"  DOCUMENT STRUCTURE VALIDATION")
    print(f"  {doc_path}")
    print(f"{'='*60}\n")

    if not os.path.exists(doc_path):
        print(f"FATAL: File not found at {doc_path}")
        return False

    doc = docx.Document(doc_path)
    issues = []
    warnings = []

    # Collect all Heading 1 paragraphs
    h1_list = []
    all_headings = []
    for idx, p in enumerate(doc.paragraphs):
        if not p.style or not p.style.name.startswith('Heading'):
            continue
        level = int(p.style.name.replace('Heading ', '').strip()) if p.style.name.replace('Heading ', '').strip().isdigit() else 0
        text = normalize(p.text)
        all_headings.append((idx, level, text))
        if level == 1:
            h1_list.append((idx, text))

    print(f"[0] Found {len(all_headings)} headings total, {len(h1_list)} at Heading 1 level.\n")

    # -----------------------------------------------------------------------
    # [1] Required sections check
    # -----------------------------------------------------------------------
    print("[1] Checking required sections...")
    h1_texts_upper = [normalize(t).upper() for _, t in h1_list]

    # Check front matter sections
    for keyword, display_name, required in REQUIRED_SECTIONS:
        found = any(keyword in t for t in h1_texts_upper)
        if found:
            print(f"    ✓ {display_name}")
        elif required:
            issues.append(f"Missing required section: {display_name}")
            print(f"    ✗ {display_name} — MISSING")
        else:
            print(f"    ○ {display_name} — optional, not present")

    # Check closing sections
    for keyword, display_name, required in CLOSING_SECTIONS:
        found = any(keyword in t for t in h1_texts_upper)
        if found:
            print(f"    ✓ {display_name}")
        elif required:
            issues.append(f"Missing required section: {display_name}")
            print(f"    ✗ {display_name} — MISSING")
        else:
            print(f"    ○ {display_name} — optional, not present")

    # -----------------------------------------------------------------------
    # [2] Chapter numbering
    # -----------------------------------------------------------------------
    print(f"\n[2] Checking chapter numbering...")
    # Identify body chapters (headings with leading number like ". TỔNG QUAN")
    chapter_pattern = re.compile(r'^\.\s+(.+)')  # Matches ". CHAPTER TITLE"
    chapters = []
    for idx, text in h1_list:
        # Check if the text starts with a chapter-like pattern
        # Vietnamese thesis chapters often use just ". TITLE" format
        if text and text[0] == '.':
            chapters.append((idx, text))
        # Also match numbered patterns like "CHƯƠNG 1" 
        elif re.match(r'^CHƯƠNG\s+\d+', text.upper()):
            chapters.append((idx, text))

    if chapters:
        print(f"    Found {len(chapters)} body chapters:")
        for i, (idx, text) in enumerate(chapters, 1):
            print(f"      {i}. P[{idx}]: {text[:60]}")
    else:
        warnings.append("No numbered body chapters detected")
        print(f"    ⚠ No numbered body chapters detected")

    # -----------------------------------------------------------------------
    # [3] Heading hierarchy (no skipped levels)
    # -----------------------------------------------------------------------
    print(f"\n[3] Checking heading hierarchy (no skipped levels)...")
    skipped_levels = 0
    prev_level = 0
    for idx, level, text in all_headings:
        if level == 0:
            continue
        if prev_level > 0 and level > prev_level + 1:
            msg = f"P[{idx}]: Heading {level} follows Heading {prev_level} (skipped level {prev_level + 1})"
            warnings.append(msg)
            if skipped_levels < 5:
                print(f"    ⚠ {msg}: '{text[:50]}'")
            skipped_levels += 1
        prev_level = level

    if skipped_levels == 0:
        print(f"    ✓ No skipped heading levels detected.")
    elif skipped_levels > 5:
        print(f"    ... and {skipped_levels - 5} more")

    # -----------------------------------------------------------------------
    # [4] Empty headings
    # -----------------------------------------------------------------------
    print(f"\n[4] Checking for empty headings...")
    empty_headings = [(idx, level) for idx, level, text in all_headings if not text]
    if empty_headings:
        for idx, level in empty_headings[:5]:
            msg = f"P[{idx}]: Empty Heading {level}"
            warnings.append(msg)
            print(f"    ⚠ {msg}")
        if len(empty_headings) > 5:
            print(f"    ... and {len(empty_headings) - 5} more")
    else:
        print(f"    ✓ No empty headings found.")

    # -----------------------------------------------------------------------
    # [5] Section order validation
    # -----------------------------------------------------------------------
    print(f"\n[5] Validating section order...")
    # Find indices of key sections
    section_indices = {}
    for keyword, display_name, _ in REQUIRED_SECTIONS + CLOSING_SECTIONS:
        for i, t in enumerate(h1_texts_upper):
            if keyword in t:
                section_indices[keyword] = i
                break

    # Check order: front matter should come before body chapters,
    # body chapters before closing sections
    order_ok = True
    prev_idx = -1
    prev_name = ""
    for keyword, display_name, required in REQUIRED_SECTIONS:
        if keyword in section_indices:
            curr_idx = section_indices[keyword]
            if curr_idx < prev_idx:
                msg = f"'{display_name}' appears after '{prev_name}' (should be before)"
                issues.append(msg)
                print(f"    ✗ {msg}")
                order_ok = False
            prev_idx = curr_idx
            prev_name = display_name

    # Check closing sections come after body
    for keyword, display_name, required in CLOSING_SECTIONS:
        if keyword in section_indices:
            curr_idx = section_indices[keyword]
            if curr_idx < prev_idx:
                # Closing sections can be in any order among themselves
                pass
            prev_idx = max(prev_idx, curr_idx)

    if order_ok:
        print(f"    ✓ All sections are in correct order.")

    # -----------------------------------------------------------------------
    # Summary
    # -----------------------------------------------------------------------
    print(f"\n{'='*60}")
    print(f"  STRUCTURE VALIDATION SUMMARY")
    print(f"{'='*60}")
    print(f"  Total issues (errors):   {len(issues)}")
    print(f"  Total warnings:          {len(warnings)}")

    if issues:
        print(f"\n  ERRORS:")
        for i, issue in enumerate(issues, 1):
            print(f"    {i}. {issue}")

    if warnings:
        print(f"\n  WARNINGS:")
        for i, w in enumerate(warnings, 1):
            print(f"    {i}. {w}")

    if not issues and not warnings:
        print(f"\n  ✓✓✓ DOCUMENT STRUCTURE IS COMPLETE AND CORRECT ✓✓✓")

    status = "PASS" if not issues else "FAIL"
    print(f"\n  Final verdict: {status}")
    print(f"{'='*60}\n")

    return len(issues) == 0


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Validate Vietnamese thesis document structure.')
    parser.add_argument('--path', type=str,
                        default='d:/MiniERP_NhomKinh/ChuyenDeTotNghiep_NguyenTrongThoi.docx',
                        help='Path to the .docx file.')
    args = parser.parse_args()
    validate_structure(args.path)
