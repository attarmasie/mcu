/**
 * Format phone number for WhatsApp link
 * Converts local format (0xxx) to international format (62xxx for Indonesia)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");
  // If starts with 0, replace with 62 (Indonesia)
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(
  date: string | Date | undefined | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString(
    "id-ID",
    options ?? {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

/**
 * Format datetime to Indonesian locale
 */
export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID");
}

/**
 * Format gender value to display text
 */
export function formatGender(gender: string | undefined | null): string {
  if (!gender) return "-";
  const genderMap: Record<string, string> = {
    male: "Male",
    female: "Female",
    other: "Other",
  };
  return genderMap[gender] || gender;
}

/**
 * Format patient type value to display text
 */
export function formatPatientType(type: string | undefined | null): string {
  if (!type) return "-";
  const typeMap: Record<string, string> = {
    teacher: "Teacher",
    student: "Student",
    general: "General",
  };
  return typeMap[type] || type;
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}
