# md-to-beautiful-pdf 方案设计

## 1. 项目目标

做一个开源工具，把 Markdown 文档转换成分页协调、视觉漂亮、适合分享的 PDF。

这个项目要解决的问题是：用户在 Typora 里用喜欢的主题预览 Markdown 时效果很好，但直接导出 PDF 后，经常出现分页处大量空白、标题孤立、表格被不自然切开、图片和正文分布不均匀等问题。原因是 Typora 主题主要服务于连续滚动阅读，而 PDF 属于分页排版，两者的排版逻辑不同。

本项目的核心目标不是“原样复刻 Typora 导出”，而是建立一条更稳定的工作流：

```text
Markdown 负责写作
Typora 负责实时预览
Typst 负责最终 PDF 精排
```

最终用户应该可以用一条命令把 Markdown 转成高质量 PDF：

```bash
mdpdf input.md
```

也可以指定主题：

```bash
mdpdf input.md --theme purple --paper a4
```

## 2. 推荐技术路线

选择 Typst 作为核心排版引擎。

不建议第一版继续使用 Typora/Chrome 的 HTML/CSS 导出，也不建议第一版直接使用 LaTeX。

### 为什么选择 Typst

Typst 是现代排版系统，适合生成 PDF。它比浏览器导出更懂分页，比 LaTeX 更容易维护和设计视觉模板。

Typst 的优势：

- 天然面向分页排版，适合 PDF。
- 支持中文字体、页眉页脚、目录、标题样式、代码块、表格和图片。
- 模板语法比 LaTeX 更现代，后续做主题扩展更容易。
- CLI 工具链简单，适合封装成一个命令行工具。
- 适合做“漂亮文档模板”，而不仅仅是学术论文。

Typst 的定位：

```text
不是 Typora 主题的替代品，而是 Markdown 最终发布 PDF 的精排出口。
```

## 3. 用户使用场景

### 场景一：写作分享

用户用 Typora 写一篇 Markdown 文档，使用自己喜欢的主题进行预览。写完后，不直接从 Typora 导出 PDF，而是运行本工具生成最终分享版 PDF。

### 场景二：技术说明文档

用户写 README、技术方案、教程、产品说明，需要导出为结构清晰、分页自然、代码块好看的 PDF。

### 场景三：课程笔记或学习资料

用户写带标题、表格、图片、代码、引用块的长文档，希望生成一份阅读体验接近正式电子书或讲义的 PDF。

### 场景四：论文/报告类文档

用户不想直接写 LaTeX，但希望获得接近 LaTeX 的分页质量。

## 4. 第一版范围

第一版目标是做一个可用、清晰、漂亮的最小版本，不追求覆盖所有 Markdown 边界情况。

### 必须支持

- 输入 `.md` 文件。
- 输出 `.pdf` 文件。
- 支持中文正文。
- 支持一级到六级标题。
- 支持段落、粗体、斜体、行内代码。
- 支持无序列表、有序列表。
- 支持引用块。
- 支持代码块，并带基础语法高亮。
- 支持 Markdown 表格。
- 支持本地图片。
- 支持自动目录。
- 支持 A4 页面。
- 支持至少 2 个主题：`minimal` 和 `purple`。
- 支持页眉、页脚、页码。
- 尽量避免标题孤立在页底。
- 尽量避免表格、代码块、图片被不自然切开。

### 暂不支持

- 完整复刻任意 Typora CSS 主题。
- 复杂 HTML 内嵌内容。
- Mermaid 图表自动渲染。
- 交叉引用、参考文献管理。
- Word 导出。
- GUI 图形界面。
- 在线服务。

## 5. 核心工作流

推荐实现流程：

```text
input.md
  ↓
Markdown 解析
  ↓
中间 AST 或 Pandoc AST
  ↓
Typst 文档生成
  ↓
套用 Typst 主题模板
  ↓
typst compile
  ↓
output.pdf
```

第一版可以优先使用 Pandoc 作为 Markdown 到 Typst 的转换基础，然后在外层封装主题模板和命令行体验。

推荐第一版路线：

```text
Markdown
  ↓ pandoc
Typst body content
  ↓ inject into template
完整 .typ 文件
  ↓ typst compile
PDF
```

## 6. 项目命名

推荐仓库名：

```text
md-to-beautiful-pdf
```

一句话介绍：

```text
Turn Markdown into polished, well-paginated PDFs with Typst templates.
```

中文介绍：

```text
把 Markdown 转换成分页自然、视觉漂亮、适合分享的精排 PDF。
```

## 7. 命令行设计

第一版命令：

```bash
mdpdf input.md
```

默认输出：

```text
input.pdf
```

推荐参数：

```bash
mdpdf input.md --output output.pdf
mdpdf input.md --theme purple
mdpdf input.md --paper a4
mdpdf input.md --toc
mdpdf input.md --no-toc
mdpdf input.md --title "我的文档"
mdpdf input.md --author "Summer"
```

参数说明：

| 参数 | 作用 |
|---|---|
| `input.md` | 输入 Markdown 文件 |
| `--output` | 指定输出 PDF 路径 |
| `--theme` | 指定主题，默认 `minimal` |
| `--paper` | 页面尺寸，默认 `a4` |
| `--toc` | 开启目录 |
| `--no-toc` | 关闭目录 |
| `--title` | 覆盖文档标题 |
| `--author` | 设置作者 |
| `--keep-typ` | 保留中间 `.typ` 文件，方便调试 |

## 8. 主题设计

第一版建议内置两个主题。

### minimal

定位：干净、耐读、适合普通文档。

视觉特征：

- 白色背景。
- 深灰正文。
- 清晰的标题层级。
- 克制的分割线。
- 代码块使用浅灰背景。
- 表格边框浅色。
- 适合打印。

### purple

定位：灵感来自 Typora 紫色主题，但不是直接复制 CSS。

视觉特征：

- 白色背景。
- 紫色作为强调色。
- 一级标题带左侧色块或下划线。
- 行内代码使用浅紫背景。
- 引用块使用淡紫边框。
- 表格表头使用极浅紫底色。
- 页眉或页脚使用紫色细线。

注意：主题应该是“Typora 风格灵感”，不要声称完全兼容 Typora 主题。

## 9. 分页质量要求

这是本项目的核心价值。

需要重点处理以下问题：

### 标题分页

标题不应该孤零零出现在页面底部。如果标题后面没有足够空间显示至少一小段正文，应该把标题移动到下一页。

实现方向：

- 在 Typst 模板里对 heading 设置合理的 block/spacing。
- 对标题后的内容使用 keep 逻辑。

### 表格分页

短表格尽量不跨页。长表格可以跨页，但表头需要重复或至少保持结构清晰。

第一版策略：

- 小表格整体 keep。
- 大表格允许分页。
- 表格前后留出稳定间距。

### 代码块分页

短代码块尽量不切开。长代码块允许跨页，但需要保持样式连续。

第一版策略：

- 给代码块设置固定背景、内边距、圆角。
- 短代码块整体 keep。
- 长代码块允许分页。

### 图片分页

图片不应该被切开。图片和图片说明应该尽量在同一页。

第一版策略：

- 图片最大宽度为页面正文宽度。
- 图片最大高度限制在页面高度的一定比例内。
- 图片和 caption 绑定。

### 空白优化

不要为了避免切分而产生过大的页面空白。

第一版策略：

- 对标题、短表格、短代码块使用 keep。
- 对长表格、长代码块不强行 keep。
- 给用户留出手动分页标记。

## 10. 手动控制语法

自动分页不可能在所有场景都完美，所以需要提供少量简单的手动控制语法。

建议支持这些 Markdown 注释：

```md
<!-- pagebreak -->
```

效果：强制分页。

```md
<!-- keep-next -->
```

效果：尽量让当前位置后的下一个块和当前块在同一页。

```md
<!-- no-toc -->
```

效果：当前标题不进入目录。第一版可以暂缓实现。

这些控制语法应该是渐进增强。普通 Markdown 不写这些注释也能正常生成 PDF。

## 11. 推荐项目结构

```text
md-to-beautiful-pdf/
├── README.md
├── package.json
├── src/
│   ├── cli.ts
│   ├── config.ts
│   ├── convert.ts
│   ├── markdown.ts
│   ├── typst.ts
│   └── themes.ts
├── themes/
│   ├── minimal.typ
│   └── purple.typ
├── examples/
│   ├── basic.md
│   ├── technical-report.md
│   ├── with-images.md
│   └── output/
├── docs/
│   ├── design.md
│   ├── theme-authoring.md
│   └── pagination.md
├── tests/
│   └── fixtures/
└── CHANGELOG.md
```

## 12. 推荐技术栈

推荐使用 Node.js + TypeScript 做 CLI。

原因：

- 对普通开源项目友好。
- CLI 分发方便。
- 文件处理、参数解析、子进程调用都简单。
- 后续可以扩展为 VS Code 插件或桌面应用。

核心依赖建议：

| 工具 | 用途 |
|---|---|
| `commander` | CLI 参数解析 |
| `execa` | 调用 `pandoc` 和 `typst` |
| `fs-extra` | 文件处理 |
| `zod` | 配置校验 |
| `chalk` | 终端输出美化 |

外部依赖：

| 工具 | 用途 |
|---|---|
| `pandoc` | Markdown 转 Typst 或中间格式 |
| `typst` | 编译 PDF |

第一版可以要求用户本机安装 `pandoc` 和 `typst`，CLI 启动时检查是否存在。

## 13. 配置文件

支持可选配置文件：

```text
mdpdf.config.json
```

示例：

```json
{
  "theme": "purple",
  "paper": "a4",
  "toc": true,
  "title": "Untitled",
  "author": "",
  "font": {
    "body": "PingFang SC",
    "code": "JetBrains Mono"
  }
}
```

如果没有配置文件，就使用默认配置。

## 14. README 需要强调的理念

README 不要把项目说成“Typora 导出增强器”，而应该说成：

```text
Typora is great for writing and previewing.
Typst is better for final PDF typesetting.
This project connects the two workflows.
```

中文表达：

```text
Typora 适合写作和预览，Typst 适合最终分页排版。这个项目连接两者。
```

需要明确告诉用户：

- 本项目不会 100% 复刻 Typora CSS。
- 本项目追求的是最终 PDF 的分页质量和分享效果。
- 主题会借鉴 Typora 风格，但会用 Typst 重新实现。

## 15. 示例文档要求

项目必须包含一份能展示问题和效果的示例 Markdown。

示例内容应包含：

- 长标题。
- 多级标题。
- 中文段落。
- 有序和无序列表。
- 引用块。
- 行内代码。
- 多行代码块。
- 表格。
- 图片。
- 接近页尾的标题。
- 一个较长表格。

这样才能展示本工具相对 Typora 直接导出的价值。

## 16. 验收标准

Claude Code 完成第一版后，需要满足以下验收标准：

1. 可以运行 `mdpdf examples/basic.md` 并生成 PDF。
2. 可以运行 `mdpdf examples/basic.md --theme purple` 并生成紫色主题 PDF。
3. 生成的 PDF 有目录、页码、标题层级、代码块、表格和图片。
4. 标题不明显孤立在页面底部。
5. 短表格和短代码块不被粗暴切开。
6. 图片不会被切开，并且会自动缩放到页面宽度内。
7. README 写清楚安装、使用方式和项目理念。
8. 如果缺少 `pandoc` 或 `typst`，CLI 给出清晰错误提示。

## 17. 后续版本规划

### v0.2

- 增加更多主题。
- 支持自定义主题色。
- 支持 frontmatter 元数据。
- 支持封面页。
- 支持更好的图片 caption。

### v0.3

- 支持 Mermaid 图表渲染。
- 支持脚注。
- 支持参考文献。
- 支持导出中间 `.typ` 文件并允许用户手动微调。

### v1.0

- 稳定 CLI。
- 稳定主题 API。
- 提供完整文档。
- 提供多个高质量示例 PDF。

## 18. 给 Claude Code 的实现指令

请按照以下优先级实现：

1. 初始化一个 Node.js + TypeScript CLI 项目。
2. 实现 `mdpdf` 命令。
3. 检查本机是否安装 `pandoc` 和 `typst`。
4. 支持输入 Markdown 和输出 PDF。
5. 实现 `minimal` 和 `purple` 两个 Typst 主题模板。
6. 使用 Pandoc 将 Markdown 转为 Typst 内容。
7. 将 Typst 内容注入主题模板。
8. 调用 Typst 编译生成 PDF。
9. 添加 examples。
10. 写 README。
11. 添加基础测试或至少提供可重复运行的 smoke test。

不要优先做 GUI，不要优先做在线服务，不要第一版追求完整兼容所有 Typora CSS。

第一版的目标是：小而完整、能跑通、PDF 效果明显比 Typora 直接导出更协调。

