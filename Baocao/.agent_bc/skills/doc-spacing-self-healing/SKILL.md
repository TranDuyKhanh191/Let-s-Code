---
name: doc-spacing-self-healing
description: Self-healing algorithm for correcting MS Word word-stretching caused by soft line breaks in justified paragraphs, with full run-level formatting preservation.
version: 2.0.0
domain: word_processing
updated: 2026-06-03
author: Agent_BC
---

# Spacing & Line Breaks Self-Healing (doc-spacing-self-healing)

This skill describes how to diagnose, prevent, and fix justification stretching (word-stretching / "chữ thưa") in Microsoft Word documents.

## 1. Diagnostics: Root Cause of Word Stretching
*   **The Problem**: In a justified paragraph (`alignment = JUSTIFY`), when a line ends with a soft return (Shift+Enter, represented in XML as `<w:br/>` or in Python strings as `\n`), MS Word treats it as a continuation of the same paragraph but forces the text to fit both margins. Since it is not the actual end of the paragraph, Word stretches inter-word spaces dramatically on short lines.
*   **Safe States**:
    *   Left-aligned paragraphs (`alignment = LEFT`) are never affected.
    *   The final line of a justified paragraph is never affected.

---

## 2. The Healing Algorithm (v2 – Format-Preserving)
To correct a justified paragraph containing soft returns:

1.  **Detect**: Identify justified paragraphs containing `<w:br/>` elements or literal `\n` in run text.
2.  **Parse Runs**: Walk each `<w:r>` element and split runs into line groups at every break point.
3.  **Preserve Formatting**: Deep-copy `<w:rPr>` (run properties) for each run segment. This preserves:
    *   Font name and size
    *   Bold, italic, underline, strikethrough
    *   Font color and highlight
    *   Superscript/subscript
    *   All other character-level formatting
4.  **Create Paragraphs**: For each line group, create a new `<w:p>` element with deep-copied paragraph properties (`<w:pPr>`).
5.  **Insert & Remove**: Insert new paragraphs before the original, then remove the original.
6.  **Backup**: Always create a timestamped backup before any modification.

---

## 3. Implementation in python-docx

```python
from copy import deepcopy
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def split_runs_by_breaks(p):
    """Split paragraph runs into groups at <w:br/> and \\n boundaries."""
    lines = [[]]
    for r_el in p._element.findall(qn('w:r')):
        rPr = r_el.find(qn('w:rPr'))
        for child in r_el:
            if child.tag == qn('w:br'):
                lines.append([])
            elif child.tag == qn('w:t'):
                if child.text and '\\n' in child.text:
                    parts = child.text.split('\\n')
                    for i, part in enumerate(parts):
                        if part:
                            lines[-1].append((part, deepcopy(rPr) if rPr else None))
                        if i < len(parts) - 1:
                            lines.append([])
                elif child.text:
                    lines[-1].append((child.text, deepcopy(rPr) if rPr else None))
    return lines

def create_paragraph_from_line(line_runs, template_p, insert_before):
    """Create a new paragraph with preserved formatting."""
    new_p_el = OxmlElement('w:p')
    source_pPr = template_p._element.find(qn('w:pPr'))
    if source_pPr is not None:
        new_p_el.append(deepcopy(source_pPr))
    for text, rPr in line_runs:
        r_el = OxmlElement('w:r')
        if rPr is not None:
            r_el.append(rPr)
        t_el = OxmlElement('w:t')
        t_el.text = text
        t_el.set(qn('xml:space'), 'preserve')
        r_el.append(t_el)
        new_p_el.append(r_el)
    insert_before.addprevious(new_p_el)
```

This forces Word to treat each segment as a standalone paragraph, resolving the stretching bug entirely without losing any character formatting.

---

## 4. Related Scripts
*   **[fix_spacing_and_breaks.py](file:///d:/MiniERP_NhomKinh/.agent_bc/scripts/fix_spacing_and_breaks.py)**: Full implementation with backup, detection, and healing.
*   **[audit_doc_integrity.py](file:///d:/MiniERP_NhomKinh/.agent_bc/scripts/audit_doc_integrity.py)**: Check [7] scans for soft break issues as a preview.
