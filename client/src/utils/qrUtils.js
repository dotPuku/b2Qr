export function generateRandomDigits(count) {
  const digits = Math.max(1, Math.min(Number(count) || 1, 32));
  let result = '';

  for (let i = 0; i < digits; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }

  return result;
}

export function generateRandomLetters(count) {
  const length = Math.max(1, Math.min(Number(count) || 1, 32));
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return result;
}

export function formatName(str) {
  if (!str && str !== 0) return '';
  return String(str).trim().toUpperCase();
}

export function formatCode(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

export function buildGeneratedCode(prefixValue) {
  const prefix = formatCode(prefixValue || 'CODE').trim();

  if (!prefix) {
    return '';
  }

  const patterns = [
    { regex: /\[(\d+)\]/g, generator: generateRandomDigits },
    { regex: /\((\d+)\)/g, generator: generateRandomLetters },
  ];

  let result = prefix;
  let foundPattern = false;

  patterns.forEach(({ regex, generator }) => {
    const matches = [...result.matchAll(regex)];

    if (matches.length) {
      foundPattern = true;
    }

    matches.forEach((match) => {
      const patternLength = Number(match[1]);
      const replacement = generator(patternLength);
      result = result.replace(match[0], replacement);
    });
  });

  if (!foundPattern) {
    return prefix;
  }

  return result;
}

