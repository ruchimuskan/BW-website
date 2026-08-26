/** UIDAI Aadhaar: 12 digits, first digit 2–9, Verhoeff checksum. */

const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
] as const;

const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 6, 3, 0, 8, 4, 1, 7, 5, 9],
  [6, 1, 4, 2, 3, 8, 0, 7, 5, 9],
] as const;

const BLOCKED_AADHAAR = new Set([
  "123456789012",
  "012345678901",
  "111111111111",
  "222222222222",
  "999999999999",
  "000000000000",
]);

function passesVerhoeff(digits: string): boolean {
  let c = 0;
  const reversed = digits.split("").reverse();
  for (let i = 0; i < reversed.length; i += 1) {
    c = VERHOEFF_D[c]![VERHOEFF_P[i % 8]![Number(reversed[i])]!];
  }
  return c === 0;
}

function isSequentialDigits(digits: string): boolean {
  let up = true;
  let down = true;
  for (let i = 1; i < digits.length; i += 1) {
    const a = Number(digits[i - 1]);
    const b = Number(digits[i]);
    if (b !== (a + 1) % 10) up = false;
    if (b !== (a + 9) % 10) down = false;
  }
  return up || down;
}

export function getAadhaarValidationError(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 12) {
    return "Enter a valid 12-digit Aadhar number.";
  }
  if (digits[0] === "0" || digits[0] === "1") {
    return "This Aadhar number is invalid. Please enter a real Aadhar number.";
  }
  if (BLOCKED_AADHAAR.has(digits) || /^(.)\1{11}$/.test(digits) || isSequentialDigits(digits)) {
    return "This Aadhar number is invalid. Please enter a real Aadhar number.";
  }
  if (!passesVerhoeff(digits)) {
    return "This Aadhar number is invalid. Please enter a real Aadhar number.";
  }
  return null;
}

const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024;
const MIN_BYTES = 12 * 1024;
const MIN_WIDTH = 400;
const MIN_HEIGHT = 240;

function sniffImageType(bytes: Uint8Array): "jpeg" | "png" | "webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

export async function getIdPhotoValidationError(
  file: File,
  kind: "aadhar" | "student_id",
): Promise<string | null> {
  const label = kind === "aadhar" ? "Aadhar card photo" : "Student ID card photo";

  if (!file || file.size <= 0) {
    return `Please upload a valid ${label.toLowerCase()}.`;
  }
  if (file.size < MIN_BYTES) {
    return `This ${label.toLowerCase()} is invalid. Upload a clear, full photo of the card.`;
  }
  if (file.size > MAX_BYTES) {
    return `${label} must be under 8 MB.`;
  }
  if (file.type && !ALLOWED_TYPES.has(file.type.toLowerCase())) {
    return `This ${label.toLowerCase()} is invalid. Use a JPG, PNG, or WEBP image.`;
  }

  const buffer = await file.slice(0, 16).arrayBuffer();
  const sniffed = sniffImageType(new Uint8Array(buffer));
  if (!sniffed) {
    return `This ${label.toLowerCase()} is invalid. The file is not a real image.`;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("decode"));
      img.src = objectUrl;
    });
    if (image.width < MIN_WIDTH || image.height < MIN_HEIGHT) {
      return `This ${label.toLowerCase()} is invalid. Upload a clearer, larger photo of the full card.`;
    }
  } catch {
    return `This ${label.toLowerCase()} is invalid. Please choose another image.`;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  return null;
}
