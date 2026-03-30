import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const TRANSCRIPTS_DIR = path.resolve(
  process.cwd(),
  "../lennys-podcast-transcripts-main/episodes"
);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const filePath = path.join(TRANSCRIPTS_DIR, slug, "transcript.md");

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Transcript not found" }, { status: 404 });
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const fileName = `${slug}-transcript.md`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
