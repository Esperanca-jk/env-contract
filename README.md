# env-contract

A small, zero-dependency tool for catching configuration mistakes before deployment. It compares variable **names** in an example environment file with names in an actual configuration. Values are never printed.

## Requirements

Node.js 20 or later.

## Quick start

```bash
git clone https://github.com/Esperanca-jk/env-contract.git
cd env-contract
node src/cli.js .env.example .env.ci
npm test
```

Check your own files:

```bash
node src/cli.js .env.example .env
node src/cli.js .env.example .env --allow-extra --json
```

Exit codes: **0** valid; **1** mismatch or malformed lines; **2** invalid invocation or unreadable input.

## Checks

- Missing required names
- Unexpected names (optional with `--allow-extra`)
- Duplicate variable declarations
- Malformed non-comment lines

Understands `KEY=value` and `export KEY=value`. Empty lines and full-line comments are ignored. This is intentionally a **key-contract checker**, not a dotenv parser: it does not expand variables, validate values, or parse multiline values.

## CI without scheduled jobs

Run `node src/cli.js .env.example .env.ci` as a step in your *existing* CI system. A sanitized `.env.ci` fixture is included. Never commit real secrets.

## Development

`npm test` runs the built-in Node.js test runner. Contributions should include tests for behavioral changes. See [CONTRIBUTING.md](CONTRIBUTING.md).

Licensed under [MIT](LICENSE).
