import zipfile
import xml.etree.ElementTree as ET
import sys

def extract_text_from_docx(docx_path, output_path):
    try:
        with zipfile.ZipFile(docx_path, 'r') as docx:
            if 'word/document.xml' not in docx.namelist():
                print("Error: word/document.xml not found in the file.")
                return

            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            # The namespace for WordprocessingML
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            paragraphs = []
            for p in tree.findall('.//w:p', namespaces=ns):
                texts = [t.text for t in p.findall('.//w:t', namespaces=ns) if t.text]
                paragraphs.append(''.join(texts))
                
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(paragraphs))
            print(f"Successfully extracted text to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        extract_text_from_docx(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python extract_docx.py <input.docx> <output.txt>")
