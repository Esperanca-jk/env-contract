import test from 'node:test';
import assert from 'node:assert/strict';
import { parseKeys, compareEnv } from '../src/core.js';

test('ignores comments and values; supports export', () => {
  const parsed = parseKeys(' # comment\nexport API_KEY=secret=abc\n EMPTY=\n');
  assert.deepEqual([...parsed.keys], ['API_KEY', 'EMPTY']);
  assert.deepEqual(parsed.invalid, []);
});

test('detects missing and unexpected keys', () => {
  const result = compareEnv('A=\nB=\n', 'A=1\nC=2\n');
  assert.deepEqual(result.missing, ['B']);
  assert.deepEqual(result.extra, ['C']);
  assert.equal(result.ok, false);
});

test('extra keys can be permitted', () => {
  assert.equal(compareEnv('A=\n', 'A=x\nEXTRA=y\n').ok, false);
  assert.equal(compareEnv('A=\n', 'A=x\nEXTRA=y\n', { allowExtra: true }).ok, true);
});

test('reports malformed lines and duplicate keys', () => {
  const result = compareEnv('A=\nA=2\nBAD\n', 'A=3\n');
  assert.deepEqual(result.duplicates.expected, ['A']);
  assert.deepEqual(result.invalidLines.expected, [3]);
});

test('never includes secret values in results', () => {
  const result = compareEnv('TOKEN=expected-secret', 'TOKEN=actual-secret');
  assert.equal(JSON.stringify(result).includes('actual-secret'), false);
});
