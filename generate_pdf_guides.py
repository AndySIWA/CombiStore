import os
import re
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "Guide de Référence Technique — CombiStore Expo Android")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 612 - 54, 742)
            
        # Footer
        page_text = f"Page {self._pageNumber} sur {page_count}"
        self.drawRightString(612 - 54, 36, page_text)
        self.drawString(54, 36, "© 2026 CombiStore — Tous droits réservés")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 612 - 54, 48)
        
        self.restoreState()


def parse_markdown_to_flowables(md_path, styles):
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    story = []
    in_code_block = False
    code_lines = []
    in_table = False
    table_rows = []

    h1_style = ParagraphStyle(
        'CustomH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=18,
        spaceAfter=10,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'CustomH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#2563EB"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'CustomH3',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceBefore=3,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#334155"),
        leftIndent=15,
        spaceBefore=2,
        spaceAfter=2
    )

    callout_style = ParagraphStyle(
        'CustomCallout',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#1E293B"),
        backColor=colors.HexColor("#F1F5F9"),
        borderColor=colors.HexColor("#3B82F6"),
        borderWidth=1,
        borderPadding=8,
        spaceBefore=8,
        spaceAfter=8,
        borderRadius=4
    )

    code_style = ParagraphStyle(
        'CustomCode',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0F172A"),
        backColor=colors.HexColor("#F8FAFC"),
        borderColor=colors.HexColor("#CBD5E1"),
        borderWidth=0.5,
        borderPadding=6,
        spaceBefore=6,
        spaceAfter=6,
        borderRadius=3
    )

    def process_inline_formatting(text):
        text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        # Bold
        text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
        # Italic
        text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
        # Inline code
        text = re.sub(r'`(.*?)`', r'<font face="Courier" color="#2563EB"><b>\1</b></font>', text)
        # Links
        text = re.sub(r'\[(.*?)\]\((.*?)\)', r'<font color="#2563EB"><u>\1</u></font>', text)
        return text

    for line in lines:
        stripped = line.strip()

        # Code block toggle
        if stripped.startswith('```'):
            if in_code_block:
                code_text = "".join(code_lines).rstrip()
                # Clean html entities in code block
                code_text = code_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                story.append(Paragraph(f"<pre>{code_text}</pre>", code_style))
                code_lines = []
                in_code_block = False
            else:
                in_code_block = True
            continue

        if in_code_block:
            code_lines.append(line)
            continue

        # Table rows
        if stripped.startswith('|') and stripped.endswith('|'):
            if '---' in stripped:
                continue  # Header divider line
            cols = [c.strip() for c in stripped.split('|')[1:-1]]
            table_rows.append(cols)
            in_table = True
            continue
        elif in_table:
            # End of table
            if table_rows:
                table_data = []
                for idx, r in enumerate(table_rows):
                    row_data = []
                    for cell in r:
                        cell_p = process_inline_formatting(cell)
                        row_data.append(Paragraph(f"<b>{cell_p}</b>" if idx == 0 else cell_p, body_style))
                    table_data.append(row_data)

                col_widths = [504 / len(table_rows[0])] * len(table_rows[0])
                t = Table(table_data, colWidths=col_widths)
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                    ('TOPPADDING', (0, 0), (-1, -1), 6),
                    ('LEFTPADDING', (0, 0), (-1, -1), 6),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")])
                ]))
                story.append(Spacer(1, 4))
                story.append(t)
                story.append(Spacer(1, 6))
            table_rows = []
            in_table = False

        if not stripped:
            continue

        # Headers
        if stripped.startswith('# '):
            story.append(Spacer(1, 10))
            story.append(Paragraph(process_inline_formatting(stripped[2:]), h1_style))
            story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563EB"), spaceAfter=8))
        elif stripped.startswith('## '):
            story.append(Spacer(1, 8))
            story.append(Paragraph(process_inline_formatting(stripped[3:]), h2_style))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1"), spaceAfter=6))
        elif stripped.startswith('### '):
            story.append(Paragraph(process_inline_formatting(stripped[4:]), h3_style))
        elif stripped.startswith('> '):
            story.append(Paragraph(process_inline_formatting(stripped[2:]), callout_style))
        elif stripped.startswith('* ') or stripped.startswith('- '):
            story.append(Paragraph(f"• {process_inline_formatting(stripped[2:])}", bullet_style))
        elif re.match(r'^\d+\.\s', stripped):
            num_content = re.sub(r'^\d+\.\s', '', stripped)
            story.append(Paragraph(f"• {process_inline_formatting(num_content)}", bullet_style))
        elif stripped == '---':
            story.append(Spacer(1, 6))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2E8F0"), spaceAfter=6))
        else:
            story.append(Paragraph(process_inline_formatting(stripped), body_style))

    return story


def build_pdf(md_path, pdf_path):
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    styles = getSampleStyleSheet()
    story = parse_markdown_to_flowables(md_path, styles)
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated PDF: {pdf_path}")

if __name__ == '__main__':
    build_pdf('GUIDE_EXPO_UPDATES_OTA_ANDROID.md', 'GUIDE_EXPO_UPDATES_OTA_ANDROID.pdf')
    build_pdf('GUIDE_FIREBASE_GOOGLE_AUTH_ANDROID.md', 'GUIDE_FIREBASE_GOOGLE_AUTH_ANDROID.pdf')
