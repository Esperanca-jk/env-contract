// Parse names only. Values are never stored or returned.
export function parseKeys(source) {
  const keys = new Set();
  const duplicates = new Set();
  const invalid = [];
  for (const [index, line] of source.split(/\r?\n/).entries()) {
    const value = line.trim();
    if (!value || value.startsWith('#')) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(value);
    if (!match) {
      invalid.push(index + 1);
      continue;
    }
    const key = match[1];
    if (keys.has(key)) duplicates.add(key);
    keys.add(key);
  }
  return { keys, duplicates: [...duplicates].sort(), invalid };
}

export function compareEnv(expectedSource, actualSource, options = {}) {
  const expected = parseKeys(expectedSource);
  const actual = parseKeys(actualSource);
  const missing = [...expected.keys].filter(key => !actual.keys.has(key)).sort();
  const extra = [...actual.keys].filter(key => !expected.keys.has(key)).sort();
  return {
    ok: !missing.length && (!extra.length || options.allowExtra === true) &&
      !expected.duplicates.length && !actual.duplicates.length &&
      !expected.invalid.length && !actual.invalid.length,
    missing,
    extra,
    duplicates: { expected: expected.duplicates, actual: actual.duplicates },
    invalidLines: { expected: expected.invalid, actual: actual.invalid }
  };
}
