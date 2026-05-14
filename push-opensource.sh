#!/usr/bin/env bash
# 提交所有改动并推送到 GitHub
set -e

cd "$(dirname "$0")"

if [ -f .git/index.lock ]; then
  echo "→ 删除残留的 git 锁文件..."
  rm -f .git/index.lock
fi

# 删除多余主题文件（只保留 minimal 和 purple-typora）
echo "→ 删除多余主题文件..."
rm -f themes/latex.typ themes/opencode.typ themes/purple-plain.typ \
      themes/purple.typ themes/spring.typ themes/typora-purple.typ

# 删除旧示例 PDF
echo "→ 删除旧示例 PDF..."
rm -f examples/basic-purple.pdf examples/basic-typora-purple.pdf

# 暂存代码和主题改动（排除临时文件）
git add \
  src/convert.ts \
  src/typst.ts \
  dist/ \
  themes/minimal.typ \
  themes/purple-typora.typ \
  .github/ \
  CONTRIBUTING.md \
  README.md \
  package.json \
  tests/smoke.js

git commit -m "fix: CI setup-typst version and missing output directory

- .github/workflows/ci.yml: upgrade setup-typst@v4 → @v5 (v4 deprecated)
- .github/workflows/ci.yml: add mkdir -p examples/output before smoke test
  (directory is in .gitignore so it does not exist on a fresh checkout)

Also includes prior changes:
- src/typst.ts: fixTableColumnWidths() for smart table column sizing
- src/convert.ts: apply fixTableColumnWidths() in pipeline
- themes/purple-typora.typ, minimal.typ: #show table.cell alignment fix,
  breakable code blocks
- .github/: issue templates, PR template
- CONTRIBUTING.md, README.md: open-source documentation fixes
- tests/smoke.js, src/: update built-in theme references"

git push origin main

echo ""
echo "✓ 推送完成！"
echo "  https://github.com/summer157/md-to-beautiful-pdf"
