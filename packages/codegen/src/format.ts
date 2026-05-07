// Copyright 2022 Cognite AS

import { spawnSync } from 'node:child_process';

const biomeBin = require.resolve('@biomejs/biome/bin/biome');

/**
 * Run the generated code through biome's formatter, linter and import sorter
 * (`biome check --write`) so the codegen output matches what `yarn lint` expects.
 * Without this the next `yarn lint:fix` would rewrite the generated files,
 * making the CI codegen-diff check fail.
 */
export function formatWithBiome(code: string, filePath: string): string {
  const result = spawnSync(
    process.execPath,
    [biomeBin, 'check', '--write', `--stdin-file-path=${filePath}`],
    { input: code, encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 }
  );
  if (result.status !== 0) {
    throw new Error(
      `biome failed to format ${filePath} (status ${result.status}): ${result.stderr || ''}`
    );
  }
  return result.stdout;
}
