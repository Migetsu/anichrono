/*
  Strips comments from source files in src/ and api/.
  - Handles .js, .ts via strip-comments
  - Handles .css, .scss via strip-css-comments
  - Handles .vue: removes HTML <!-- --> in template, JS comments in <script>, CSS comments in <style>
  - Skips node_modules, dist, .git
*/

import fs from 'fs/promises'
import path from 'path'
import { globby } from 'globby'
import stripJs from 'strip-comments'
import stripCss from 'strip-css-comments'

const ROOTS = ['src', 'api']
const exts = ['js', 'ts', 'vue', 'css', 'scss']

function stripHtmlComments(content) {
  // Remove HTML comments <!-- ... --> including multiline
  return content.replace(/<!--([\s\S]*?)-->/g, '')
}

function stripVue(content) {
  let output = content
  // 1) Remove HTML comments anywhere
  output = stripHtmlComments(output)

  // 2) Strip JS inside <script> blocks
  output = output.replace(/(<script[\s\S]*?>)([\s\S]*?)(<\/script>)/g, (m, open, inner, close) => {
    try {
      const stripped = stripJs(inner)
      return `${open}${stripped}${close}`
    } catch {
      return m
    }
  })

  // 3) Strip CSS inside <style> blocks
  output = output.replace(/(<style[\s\S]*?>)([\s\S]*?)(<\/style>)/g, (m, open, inner, close) => {
    try {
      const stripped = stripCss(inner, { preserve: false })
      return `${open}${stripped}${close}`
    } catch {
      return m
    }
  })

  return output
}

function stripByExt(ext, content) {
  if (ext === 'vue') return stripVue(content)
  if (ext === 'js' || ext === 'ts') return stripJs(content)
  if (ext === 'css' || ext === 'scss') return stripCss(content, { preserve: false })
  return content
}

async function run() {
  const patterns = ROOTS.map(r => `${r}/**/*.{${exts.join(',')}}`)
  const files = await globby(patterns, {
    gitignore: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**']
  })

  let changed = 0
  await Promise.all(files.map(async (file) => {
    const ext = path.extname(file).slice(1)
    const original = await fs.readFile(file, 'utf8')
    const stripped = stripByExt(ext, original)
    if (stripped !== original) {
      await fs.writeFile(file, stripped, 'utf8')
      changed++
    }
  }))

  console.log(`Comments stripped in ${changed} files`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})


