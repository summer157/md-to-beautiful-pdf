# md-to-beautiful-pdf

把 Markdown 转换成分页自然、视觉漂亮、适合分享的精排 PDF。

Turn Markdown into polished, well-paginated PDFs with Typst templates.

`md-to-beautiful-pdf` 是一个命令行工具：输入一份 `.md` 文档，输出一份对应的 `.pdf`。它用 Pandoc 把 Markdown 转成 Typst，再套用面向 PDF 排版的 Typst 主题，最后由 Typst 编译生成 PDF。

```text
Markdown (.md) -> Pandoc -> Typst theme -> PDF
```

## 适合谁

如果你习惯用 Typora、Obsidian、VS Code 或其他编辑器写 Markdown，但希望导出的 PDF 更像正式文档、技术报告、讲义或分享稿，这个工具就是为这个场景做的。

它解决的主要问题是：

- 标题孤零零地卡在页底。
- 表格被整体推到下一页，前一页留下大量空白。
- 代码块、引用块、图片和正文间距不协调。
- Typora CSS 主题适合滚动阅读，但不一定适合分页 PDF。

这个项目不是“100% 复刻 Typora 导出”。它的目标是把 Typora 主题的视觉风格重新实现为 Typst 模板，让 PDF 分页更自然。

## 功能特性

- 一条命令把一个 Markdown 文件导出成一个 PDF。
- 内置 `minimal` 和 `purple` 主题。
- 支持导入 Typora CSS 主题：`mdpdf import-theme <css>`。
- 支持查看全部主题：`mdpdf themes`。
- 自动从第一个 H1 标题识别文档标题。
- 支持目录、页眉、页脚和页码。
- 支持中文文档。
- 支持 Markdown 表格、代码块、引用块、列表和本地图片。
- 对 Pandoc 生成的表格做后处理，让 Typst 可以自然跨页分页。
- 支持手动分页标记。

## 环境要求

请先安装：

| 工具 | 版本 | macOS | Linux | Windows |
| --- | --- | --- | --- | --- |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) | `apt install nodejs` 或 [nodejs.org](https://nodejs.org) | [nodejs.org](https://nodejs.org) |
| Pandoc | 较新版本 | `brew install pandoc` | `apt install pandoc` | [pandoc.org/installing](https://pandoc.org/installing.html) |
| Typst | 较新版本 | `brew install typst` | `snap install typst` | [github.com/typst/typst/releases](https://github.com/typst/typst/releases) |

如果缺少 `pandoc` 或 `typst`，CLI 会给出明确错误提示。

## 安装

从 npm 安装：

```bash
npm install -g md-to-beautiful-pdf
```

也可以直接从 GitHub 使用：

```bash
git clone https://github.com/summer157/md-to-beautiful-pdf.git
cd md-to-beautiful-pdf
npm install
npm run build
node dist/cli.js examples/basic.md --theme purple
```

## 基本用法

导出 PDF：

```bash
mdpdf input.md
```

默认会在 `input.md` 同目录生成：

```text
input.pdf
```

指定主题和输出路径：

```bash
mdpdf input.md --theme purple --output report.pdf
```

完整示例：

```bash
mdpdf input.md \
  --output report.pdf \
  --theme purple-typora \
  --paper a4 \
  --title "项目设计文档" \
  --author "张三" \
  --toc
```

## 命令参数

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `input.md` | 必填 | 输入 Markdown 文件 |
| `-o, --output <path>` | 与输入同名 | 输出 PDF 路径 |
| `--theme <name>` | `minimal` | 主题名称 |
| `--paper <size>` | `a4` | Typst 纸张尺寸，`letter` 会自动映射为 `us-letter` |
| `--toc` / `--no-toc` | `--toc` | 显示或隐藏目录 |
| `--title <text>` | 第一个 H1 | 覆盖文档标题 |
| `--author <text>` | 空 | 文档作者 |
| `--date <text>` | 空 | 文档日期 |
| `--keep-typ` | 关闭 | 保留中间 `.typ` 文件，方便调试主题 |

## 主题

查看全部可用主题：

```bash
mdpdf themes
```

内置主题（2 个核心主题）：

- `minimal`：克制、干净、适合打印。
- `purple`：紫色强调色，适合技术说明和分享文档。

仓库附带主题（克隆或 npm 安装后即可使用）：

- `purple-typora`：从 Typora purple CSS 主题迁移的排版风格。
- `purple-plain`：purple 的简化版，无页眉装饰。
- `latex`：仿 LaTeX 风格，适合学术文档。
- `opencode`：深色代码块，适合技术博客和开发文档。
- `spring`：清新绿色调，适合轻量笔记和分享文档。
- `typora-purple`：另一款紫色系主题变体。

所有主题都是普通 `.typ` 文件，位于 `themes/` 目录，可以直接编辑或以此为基础创建自己的主题。

## 导入 Typora CSS 主题

先找到你的 Typora 主题文件，再执行导入命令。

**macOS** — Typora 主题默认存放路径：

```
~/Library/Application Support/abnerworks.Typora/themes/
```

**Windows** — Typora 主题默认存放路径：

```
%APPDATA%\Typora\themes\
```

也可以在 Typora 里点击「偏好设置 → 外观 → 打开主题文件夹」直接定位到 CSS 文件。

导入示例（将 `your-theme.css` 替换为你实际的文件路径）：

```bash
# macOS
mdpdf import-theme ~/Library/Application\ Support/abnerworks.Typora/themes/your-theme.css

# Windows（在 PowerShell 或命令提示符中）
mdpdf import-theme "%APPDATA%\Typora\themes\your-theme.css"

# 或者将 CSS 文件复制到当前目录后直接使用
mdpdf import-theme ./your-theme.css
```

如果 CSS 文件名是 `purple.css`，工具会自动生成：

```text
themes/purple-typora.typ
```

这样不会覆盖内置的 `purple` 主题。

指定主题名称：

```bash
mdpdf import-theme purple.css --name typora-purple
```

使用导入后的主题：

```bash
mdpdf input.md --theme typora-purple
```

导入器会尽力提取：

- `:root` 中的 CSS 变量。
- 常见颜色变量，例如 `--title-color`、`--accent-color`、`--primary-color`。
- `#hex`、`rgb()`、`rgba()` 颜色。
- 正文、标题和代码字体。
- 行内代码、代码块、引用块、表格颜色。
- H1 居中和下划线、H2 左边框和底边框等标题装饰。

CSS 是浏览器布局语言，Typst 是分页排版语言，所以导入结果是“风格迁移”，不是像素级复刻。

## 配置文件

可以在 Markdown 文件同目录创建 `mdpdf.config.json`：

```json
{
  "theme": "purple-typora",
  "paper": "a4",
  "toc": true,
  "author": "张三",
  "date": "2026-01-01"
}
```

命令行参数会覆盖配置文件。

## 手动分页

强制分页：

```markdown
<!-- pagebreak -->
```

弱提示：让下一段尽量跟当前块保持在一起：

```markdown
<!-- keep-next -->
```

## 示例

```bash
mdpdf examples/basic.md --theme minimal
mdpdf examples/basic.md --theme purple
mdpdf examples/technical-report.md --theme purple --title "架构设计方案"
```

## 开发

```bash
npm install
npm run build
npm test
```

常用调试命令：

```bash
node dist/cli.js themes
node dist/cli.js import-theme ./purple.css --name purple-typora
node dist/cli.js examples/basic.md --theme purple-typora --keep-typ
```

发布 npm 包前建议先执行：

```bash
npm run build
npm pack --dry-run
```

## 常见问题

### 其他人可以直接用这个仓库实现 Markdown 转 PDF 吗？

可以。只要对方安装了 Node.js、Pandoc 和 Typst，就可以 clone 这个仓库，执行 `npm install && npm run build`，然后用 `node dist/cli.js input.md` 转 PDF。发布到 npm 后，也可以直接 `npm install -g md-to-beautiful-pdf` 使用 `mdpdf` 命令。

### 出现 unknown font family warning 怎么办？

这是 Typst 提示当前系统缺少某些字体，例如 `Open Sans`、`JetBrains Mono` 或 `Noto Sans CJK SC`。通常不会影响 PDF 生成。想要更好的中文效果，可以安装 PingFang SC、Noto Sans CJK SC 或 Source Han Sans SC。

### 为什么不直接使用 Typora CSS 导出？

CSS 主题主要服务于屏幕滚动阅读；PDF 是分页排版。这个项目用 Typst 重新实现主题，是为了更好地处理页眉页脚、目录、表格跨页和标题分页。

## English

`md-to-beautiful-pdf` is a CLI that converts one Markdown file into one polished PDF. It uses Pandoc for Markdown-to-Typst conversion, applies a Typst theme, then compiles the final PDF with Typst.

Quick start:

```bash
npm install -g md-to-beautiful-pdf
mdpdf input.md --theme purple --output report.pdf
```

Import a Typora CSS theme:

```bash
mdpdf import-theme purple.css --name typora-purple
mdpdf input.md --theme typora-purple
```

Requirements: Node.js 18+, Pandoc, and Typst.

This project does not attempt to replicate Typora CSS pixel by pixel. It ports the visual style into Typst so the final PDF can have better pagination.

## License

MIT
