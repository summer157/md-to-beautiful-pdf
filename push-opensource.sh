#!/usr/bin/env bash
# 运行这个脚本来完成所有改动的提交和推送
# 使用方法：在终端里 cd 到项目根目录，然后 bash push-opensource.sh

set -e

cd "$(dirname "$0")"

# 删除可能残留的 git 锁文件
if [ -f .git/index.lock ]; then
  echo "→ 删除残留的 git 锁文件..."
  rm -f .git/index.lock
fi

# 删除多余主题文件（只保留 minimal 和 purple-typora）
echo "→ 删除多余主题文件..."
rm -f themes/latex.typ themes/opencode.typ themes/purple-plain.typ \
      themes/purple.typ themes/spring.typ themes/typora-purple.typ

# 删除已不再对应有效主题的示例 PDF
echo "→ 删除旧示例 PDF..."
rm -f examples/basic-purple.pdf examples/basic-typora-purple.pdf

# 暂存所有改动
git add -A

# 提交
git commit -m "refactor: keep only minimal and purple-typora themes, remove others

Themes removed: latex, opencode, purple-plain, purple, spring, typora-purple
Themes kept: minimal, purple-typora

- themes/: deleted 6 .typ files
- examples/: deleted basic-purple.pdf and basic-typora-purple.pdf
- src/cli.ts: update built-in theme tag list
- src/import-theme.ts: update BUILTIN_THEMES set
- src/themes.ts: update fallback theme list
- tests/smoke.js: replace purple theme test with purple-typora, renumber steps
- README.md: update all theme references and examples
- CONTRIBUTING.md: update theme references"

# 推送到 GitHub
git push origin main

echo ""
echo "✓ 全部推送完成！"
echo "  https://github.com/summer157/md-to-beautiful-pdf"
