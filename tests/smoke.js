#!/usr/bin/env node
/**
 * Smoke test: build the project and convert examples with the two built-in themes.
 * Run: node tests/smoke.js
 */

import { execSync } from 'child_process'
import { existsSync, unlinkSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`)
  execSync(cmd, { cwd: root, stdio: 'inherit', ...opts })
}

function check(path, label) {
  if (!existsSync(path)) {
    console.error(`  ✗ FAIL: expected output not found: ${path}`)
    process.exit(1)
  }
  console.log(`  ✓ ${label}`)
  unlinkSync(path)
}

console.log('\n=== md-to-beautiful-pdf smoke test ===\n')

// Build
console.log('1. Building TypeScript...')
run('npm run build')
console.log()

const cli = resolve(root, 'dist/cli.js')

// Test minimal theme
console.log('2. Converting examples/basic.md (minimal theme)...')
run(`node ${cli} examples/basic.md --theme minimal --no-toc --output examples/output/basic-minimal.pdf`)
check(resolve(root, 'examples/output/basic-minimal.pdf'), 'basic.md → minimal theme PDF generated')
console.log()

// Test purple-typora theme
console.log('3. Converting examples/basic.md (purple-typora theme)...')
run(`node ${cli} examples/basic.md --theme purple-typora --output examples/output/basic-purple-typora.pdf`)
check(resolve(root, 'examples/output/basic-purple-typora.pdf'), 'basic.md → purple-typora theme PDF generated')
console.log()

// Test technical report
console.log('4. Converting examples/technical-report.md...')
run(`node ${cli} examples/technical-report.md --theme purple-typora --title "缓存架构方案" --output examples/output/technical-report.pdf`)
check(resolve(root, 'examples/output/technical-report.pdf'), 'technical-report.md → PDF generated')
console.log()

// Test letter paper alias
console.log('5. Converting examples/basic.md with --paper letter...')
run(`node ${cli} examples/basic.md --theme purple-typora --paper letter --no-toc --output examples/output/basic-letter.pdf`)
check(resolve(root, 'examples/output/basic-letter.pdf'), 'letter paper alias generated a PDF')
console.log()

// Test missing dependency detection (expect failure with clear message)
console.log('6. Checking missing input file error...')
try {
  execSync(`node ${cli} nonexistent.md`, { cwd: root, stdio: 'pipe' })
  console.error('  ✗ FAIL: expected error for missing input file')
  process.exit(1)
} catch (err) {
  const stderr = err.stderr?.toString() ?? ''
  const stdout = err.stdout?.toString() ?? ''
  const output = stderr + stdout
  if (output.includes('not found') || output.includes('Error')) {
    console.log('  ✓ missing input file error message shown correctly')
  } else {
    console.error('  ✗ FAIL: error output did not contain expected message')
    console.error('  Output:', output)
    process.exit(1)
  }
}

console.log('\n=== All smoke tests passed ✓ ===\n')
