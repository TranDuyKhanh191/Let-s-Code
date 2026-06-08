import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def extract_text_from_docx(docx_path):
    text = []
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            for node in tree.iter():
                if node.tag.endswith('}t'):
                    if node.text:
                        text.append(node.text)
    except Exception as e:
        return str(e)
    return '\n'.join(text)

if __name__ == '__main__':
    path = sys.argv[1]
    out_path = sys.argv[2]
    if not os.path.exists(path):
        print(f"File not found: {path}")
    else:
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(extract_text_from_docx(path))
