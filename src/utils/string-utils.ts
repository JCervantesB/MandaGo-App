export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function trimPhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

export function formatPhoneMX(phone: string): string {
  const cleaned = trimPhone(phone);
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function formatRFC(rfc: string): string {
  if (!rfc) return '';
  return rfc.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function formatCURP(curp: string): string {
  if (!curp) return '';
  return curp.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneMX(phone: string): boolean {
  const cleaned = trimPhone(phone);
  return cleaned.length === 10;
}

export function isValidRFC(rfc: string): boolean {
  const rfcRegex = /^[A-Z&Ñ]{3,4}[A-Z0-9]{6}[A-Z0-9]{3}$/;
  return rfcRegex.test(rfc.toUpperCase());
}

export type StringUtils = {
  capitalize: typeof capitalize;
  capitalizeWords: typeof capitalizeWords;
  trimPhone: typeof trimPhone;
  formatPhoneMX: typeof formatPhoneMX;
  formatRFC: typeof formatRFC;
  formatCURP: typeof formatCURP;
  truncate: typeof truncate;
  isValidEmail: typeof isValidEmail;
  isValidPhoneMX: typeof isValidPhoneMX;
  isValidRFC: typeof isValidRFC;
};