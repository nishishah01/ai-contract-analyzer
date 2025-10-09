import os
from PyPDF2 import PdfReader
import docx

def extract_text_from_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    text = ""

    if ext == ".pdf":
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                text += page.extract_text() or ""
        except Exception as e:
            text = f"[Error extracting PDF: {e}]"

    elif ext == ".docx":
        try:
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            text = f"[Error extracting DOCX: {e}]"

    else:
        text = "[Unsupported file type for text extraction]"

    return text.strip()
