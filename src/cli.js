#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { compareEnv } from './core.js';

const args = process.argv.slice(2);
const help = 'Usage: node src/cli.js <example.env> <actual.env> [--allow-extra] [--json]';
if (args.includes('--help') || args.includes('-h')) {
  console.log(help);
} else {
  const flags = new Set(['--allow-extra', '--json']);
  const files = args.filter(arg => !arg.startsWith('-'));
  if (files.length !== 2 || args.some(arg => arg.startsWith('-') && !flags.has(arg))) {
    console.error(help);
    process.exitCode = 2;
  } else {
    try {
      const [expected, actual] = await Promise.all(files.map(file => readFile(file, 'utf8')));
      const result = compareEnv(expected, actual, { allowExtra: args.includes('--allow-extra') });
      if (args.includes('--json')) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(result.ok ? 'Environment contract OK' : 'Environment contract failed');
        for (const key of ['missing', 'extra']) {
          if (result[key].length) console.log(key + ': ' + result[key].join(', '));
        }
        for (const source of ['expected', 'actual']) {
          if (result.duplicates[source].length) console.log(source + ' duplicate keys: ' + result.duplicates[source].join(', '));
          if (result.invalidLines[source].length) console.log(source + ' malformed lines: ' + result.invalidLines[source].join(', '));
        }
      }
      process.exitCode = result.ok ? 0 : 1;
    } catch (error) {
      console.error('Could not read input files: ' + error.message);
      process.exitCode = 2;
    }
  }
}
