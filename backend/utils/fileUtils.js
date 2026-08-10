import fs from 'node:fs';
import path from 'node:path';

export async function extractPdfText(filePath) {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text.slice(0, 8000);
  } catch (err) {
    console.error('PDF extract error:', err.message);
    return '';
  }
}

export function deleteFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // ignore
  }
}

export function publicFileUrl(req, filename) {
  if (!filename) return null;
  const proto = req.protocol;
  const host = req.get('host');
  return `${proto}://${host}/uploads/${filename}`;
}

export function localFilePath(filename) {
  return path.join(process.cwd(), 'uploads', filename);
}
