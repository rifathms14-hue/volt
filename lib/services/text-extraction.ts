"use server";

import pdfParse from "pdf-parse";
import mammoth from "mammoth";

/**
 * Extract text from PDF file
 * @param buffer - PDF file buffer
 * @returns Extracted text
 */
export async function extractTextFromPDF(
  buffer: Buffer | Uint8Array
): Promise<string> {
  try {
    const pdfBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    const data = await pdfParse(pdfBuffer);
    return data.text.trim();
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error(
      `Failed to extract text from PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Extract text from DOCX file
 * @param buffer - DOCX file buffer
 * @returns Extracted text
 */
export async function extractTextFromDOCX(
  buffer: Buffer | Uint8Array
): Promise<string> {
  try {
    const docxBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    const result = await mammoth.extractRawText({ buffer: docxBuffer });
    return result.value.trim();
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw new Error(
      `Failed to extract text from DOCX: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Extract text from resume file based on file type
 * @param buffer - File buffer
 * @param filePath - File path (used to determine file type)
 * @returns Extracted text
 */
export async function extractTextFromResume(
  buffer: Buffer | Uint8Array,
  filePath: string
): Promise<string> {
  const fileExtension = filePath.split(".").pop()?.toLowerCase() || "";

  switch (fileExtension) {
    case "pdf":
      return extractTextFromPDF(buffer);
    case "docx":
    case "doc":
      return extractTextFromDOCX(buffer);
    default:
      throw new Error(`Unsupported file type: ${fileExtension}`);
  }
}
