export function generateRandomDigits(count) {
  const digits = Math.max(1, Math.min(count, 32));
  let result = '';
  // Generate digit by digit to avoid floating point scientific notation
  for (let i = 0; i < digits; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

// Helper to format prefix: uppercase and convert underscores to hyphens
export function formatPrefix(str) {
  if (!str) return '';
  return String(str).toUpperCase().replace(/_/g, '-').trim();
}

export function parsePrefixList(input) {
  if (!input && input !== 0) return [];

  const values = String(input)
    .split(',')
    .map((item) => formatPrefix(item))
    .map((item) => item.replace(/\s+/g, ''))
    .filter(Boolean);

  return [...new Set(values)];
}