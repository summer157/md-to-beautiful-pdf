#!/usr/bin/env bash
# 将 charging-flow.md 转为 PDF，输出到桌面 PDF 文件夹
set -e

cd "$(dirname "$0")"

mkdir -p ~/Desktop/PDF

echo "→ 开始转换..."
node dist/cli.js charging-flow.md \
  --theme purple-typora \
  --output ~/Desktop/PDF/charging-flow.pdf

echo ""
echo "✓ 已输出到：~/Desktop/PDF/charging-flow.pdf"
open ~/Desktop/PDF/charging-flow.pdf
