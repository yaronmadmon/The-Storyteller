import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import { getBook, getChapters } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const auth = await requireAuth();
  if ("response" in auth) return auth.response;

  try {
    const { bookId } = await params;
    const book = await getBook(auth.client, bookId);
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    const chapters = await getChapters(auth.client, bookId);
    const sortedChapters = chapters
      .filter((c) => c.polished)
      .sort((a, b) => a.number - b.number);

    const children: Paragraph[] = [];
    const title = book.title ?? book.description ?? "Untitled";
    const subtitle = book.subtitle;
    const author = book.author_name_override;

    // Title page (professional typography)
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 52,
          }),
        ],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
    if (subtitle) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: subtitle,
              italics: true,
              size: 28,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }
    if (author) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `by ${author}`,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        })
      );
    } else {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `A ${book.type} book`,
              italics: true,
              size: 22,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 },
        })
      );
    }
    children.push(new Paragraph({ children: [], pageBreakBefore: true }));

    // Table of Contents placeholder (docx TOC requires special handling)
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "Table of Contents", bold: true, size: 28 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      })
    );
    for (const ch of sortedChapters) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Chapter ${ch.number}: ${ch.title}`,
              size: 22,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }
    children.push(
      new Paragraph({ children: [], pageBreakBefore: true })
    );

    // Chapters
    for (const ch of sortedChapters) {
      if (!ch.polished) continue;
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Chapter ${ch.number}: ${ch.title}`,
              bold: true,
              size: 28,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
      const paragraphs = ch.polished.split(/\n\n+/);
      for (const p of paragraphs) {
        if (p.trim()) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: p.trim(),
                  size: 24,
                }),
              ],
              spacing: { before: 0, after: 240 },
              indent: { firstLine: 360 },
            })
          );
        }
      }
      if (ch !== sortedChapters[sortedChapters.length - 1]) {
        children.push(new Paragraph({ children: [], pageBreakBefore: true }));
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `${slugify(title)}.docx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Export failed" },
      { status: 500 }
    );
  }
}
