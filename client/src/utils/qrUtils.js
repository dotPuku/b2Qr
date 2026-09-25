export function generateRandomDigits(count) {
  const digits = Math.max(1, Math.min(Number(count) || 1, 32));
  let result = '';

  for (let i = 0; i < digits; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }

  return result;
}

export function formatPrefix(str) {
  if (!str) return '';
  return String(str).toUpperCase().trim();
}

export function buildGeneratedCode(prefixValue) {
  const prefix = formatPrefix(prefixValue || 'CODE').trim();

  if (!prefix) {
    return '';
  }

  const pattern = /\[(\d+)\]/g;
  const matches = [...prefix.matchAll(pattern)];

  if (!matches.length) {
    return prefix;
  }

  let result = prefix;

  matches.forEach((match) => {
    const patternLength = Number(match[1]);
    const replacement = generateRandomDigits(patternLength);
    result = result.replace(match[0], replacement);
  });

  if (result === prefix && !/\[\d+\]/.test(prefix)) {
    return prefix;
  }

  return result;
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