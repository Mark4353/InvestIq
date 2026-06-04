#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const strip = require('strip-comments')

const ROOT = path.resolve(__dirname, '..')
const IGNORED_DIRS = ['node_modules', 'dist', '.git', 'public']
const EXT = ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.html']

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.includes(entry.name)) continue
      walk(full)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name)
      if (EXT.includes(ext)) {
        stripFile(full)
      }
    }
  }
}

function stripFile(filePath) {
  try {
    const original = fs.readFileSync(filePath, 'utf8')
    const stripped = strip(original)
    if (stripped !== original) {
      fs.writeFileSync(filePath, stripped, 'utf8')
      console.log('Stripped comments:', path.relative(ROOT, filePath))
    }
  } catch (err) {
    console.error('Failed to process', filePath, err.message)
  }
}

const targetDirs = ['src', 'server']
for (const dir of targetDirs) {
  const p = path.join(ROOT, dir)
  if (fs.existsSync(p)) walk(p)
}
console.log('Done')
