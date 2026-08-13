import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import JSZip from "jszip";

const PDF = "application/pdf";
const DOC = "application/msword";
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const PPT = "application/vnd.ms-powerpoint";
const PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

const EXTRACTABLE = [PDF, DOCX, PPTX];

export function canExtract(fileType) {
  return EXTRACTABLE.includes(fileType);
}

export async function extractText(buffer, fileType) {
  if (fileType === PDF) return extractPdf(buffer);
  if (fileType === DOC) throw new Error("Legacy .doc files are not supported for AI");
  if (fileType === DOCX) return extractDocx(buffer);
  if (fileType === PPT) throw new Error("Legacy .ppt files are not supported for AI");
  if (fileType === PPTX) return extractPptx(buffer);
  throw new Error("Unsupported file type");
}

async function extractPdf(buffer) {
  const pdf = new PDFParse(buffer);
  const result = await pdf.getText();
  return result?.text || "";
}

async function extractDocx(buffer) {
  const { value } = await mammoth.extractRawText({ buffer });
  return value || "";
}

async function extractPptx(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const slideNames = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort(
      (a, b) => parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10)
    );

  let text = "";
  for (const name of slideNames) {
    const xml = await zip.files[name].async("string");
    const slideText = [...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)]
      .map((m) => m[1])
      .join(" ")
      .trim();
    if (slideText) text += slideText + "\n";
  }
  return text;
}
