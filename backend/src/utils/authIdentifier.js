function isEmail(value) {
  return value.includes('@');
}

function normalizeIdentifier(raw) {
  if (!raw || typeof raw !== 'string') return '';

  const trimmed = raw.trim();
  if (!trimmed) return '';

  if (isEmail(trimmed)) {
    return trimmed.toLowerCase();
  }

  let digits = trimmed.replace(/[\s\-().]/g, '');
  if (digits.startsWith('+')) {
    digits = digits.slice(1);
  }
  digits = digits.replace(/\D/g, '');

  // Cambodia local numbers often start with 0 (e.g. 012 345 678)
  if (digits.startsWith('0') && digits.length >= 9) {
    digits = `855${digits.slice(1)}`;
  }

  return digits ? `+${digits}` : trimmed;
}

function isValidIdentifier(raw) {
  const normalized = normalizeIdentifier(raw);
  if (!normalized) return false;

  if (isEmail(raw.trim())) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  }

  return /^\+\d{8,15}$/.test(normalized);
}

function getIdentifierFromBody(body = {}) {
  return body.identifier || body.email || body.phone || '';
}

module.exports = {
  normalizeIdentifier,
  isValidIdentifier,
  getIdentifierFromBody,
};
