export function normalizeIdentifier(raw) {
  if (!raw || typeof raw !== 'string') return '';

  const trimmed = raw.trim();
  if (!trimmed) return '';

  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }

  let digits = trimmed.replace(/[\s\-().]/g, '');
  if (digits.startsWith('+')) {
    digits = digits.slice(1);
  }
  digits = digits.replace(/\D/g, '');

  if (digits.startsWith('0') && digits.length >= 9) {
    digits = `855${digits.slice(1)}`;
  }

  return digits ? `+${digits}` : trimmed;
}

export function isValidIdentifier(raw) {
  const normalized = normalizeIdentifier(raw);
  if (!normalized) return false;

  if (raw.trim().includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  }

  return /^\+\d{8,15}$/.test(normalized);
}
