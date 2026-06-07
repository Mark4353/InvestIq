import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const distDir = 'dist'
const indexPath = join(distDir, 'index.html')
const notFoundPath = join(distDir, '404.html')

if (existsSync(indexPath)) {
  copyFileSync(indexPath, notFoundPath)
}
