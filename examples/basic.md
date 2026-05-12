# Markdown 转 PDF 效果展示

这是一份展示 **md-to-beautiful-pdf** 工具效果的示例文档。本文档涵盖了常见的 Markdown 元素，用于验证分页质量和视觉效果。

## 1. 文字与段落

这是一段普通的中文段落。Markdown 适合写作，Typst 适合最终排版输出。两者结合，可以获得既方便写作、又分页自然的 PDF 文档。

这是第二段。本工具的核心目标不是复刻 Typora 的 CSS 效果，而是建立一条更稳定的 PDF 精排工作流：**Markdown 负责写作，Typora 负责预览，Typst 负责最终排版。**

### 1.1 强调与行内样式

普通文字、**加粗文字**、_斜体文字_、~~删除线~~、`行内代码` 都能正确渲染。

你也可以在段落中嵌入 [超链接](https://github.com)。

### 1.2 引用块

> 工具是思想的延伸。一个好的写作工具链，不应该让你在写作时担心排版的问题——写作的时候只管写，排版的事交给工具来做。
>
> —— 某位热爱写作的程序员

## 2. 列表

### 2.1 无序列表

- 第一个要点：清晰的标题层级
- 第二个要点：自然的分页控制
  - 标题不孤立在页尾
  - 短表格不被截断
  - 图片不被切开
- 第三个要点：代码块保持完整
- 第四个要点：支持中文字体

### 2.2 有序列表

1. 安装依赖：`pandoc` 和 `typst`
2. 安装工具：`npm install -g md-to-beautiful-pdf`
3. 运行命令：`mdpdf your-document.md`
4. 查看输出：同目录下生成 `your-document.pdf`

## 3. 代码块

### 3.1 Shell 命令

```bash
# 基础用法
mdpdf input.md

# 指定主题和输出路径
mdpdf input.md --theme purple --output report.pdf

# 自定义标题和作者
mdpdf input.md --title "项目技术方案" --author "张三"
```

### 3.2 TypeScript 示例

```typescript
import { convert } from 'md-to-beautiful-pdf'

const outputPath = await convert({
  input: 'document.md',
  output: 'document.pdf',
  config: {
    theme: 'purple',
    paper: 'a4',
    toc: true,
    title: '我的文档',
    author: 'Summer',
  },
})

console.log(`PDF 生成成功：${outputPath}`)
```

### 3.3 配置文件示例

```json
{
  "theme": "purple",
  "paper": "a4",
  "toc": true,
  "author": "Your Name",
  "font": {
    "body": "PingFang SC",
    "code": "JetBrains Mono"
  }
}
```

## 4. 表格

### 4.1 功能对比

| 功能 | Typora 导出 | md-to-beautiful-pdf |
|------|------------|---------------------|
| 分页控制 | 依赖浏览器 | Typst 精排引擎 |
| 标题防孤立 | 不保证 | ✓ 自动处理 |
| 表格防截断 | 不保证 | ✓ 短表格 keep |
| 中文字体 | CSS 控制 | ✓ 原生支持 |
| 目录生成 | 有限支持 | ✓ 自动生成 |
| 主题扩展 | CSS 主题 | Typst 模板 |

### 4.2 命令行参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--theme` | string | `minimal` | 主题名称 |
| `--paper` | string | `a4` | 纸张尺寸 |
| `--toc` | boolean | `true` | 是否生成目录 |
| `--title` | string | 从 H1 提取 | 文档标题 |
| `--author` | string | 空 | 文档作者 |
| `--output` | string | 同名 PDF | 输出路径 |
| `--keep-typ` | boolean | `false` | 保留 .typ 文件 |

## 5. 图片

下图是工具的 Logo 示意图，展示图片自动缩放到页面宽度，且不会被页面切开的效果。

![示例图片](./sample-image.svg)

图片会自动缩放至页面文本宽度，不会溢出边距，也不会被截断到下一页。

## 6. 分页控制

本工具支持手动插入分页标记。

<!-- pagebreak -->

## 7. 较长的表格

下面这个表格行数较多，用于测试长表格的分页行为。长表格允许跨页，但前后保持稳定间距。

| 序号 | 组件名称 | 版本 | 用途 | 备注 |
|------|---------|------|------|------|
| 1 | commander | 12.x | CLI 参数解析 | 主流 Node.js CLI 框架 |
| 2 | execa | 9.x | 子进程调用 | 调用 pandoc 和 typst |
| 3 | fs-extra | 11.x | 文件操作 | 增强版 fs 模块 |
| 4 | zod | 3.x | 配置校验 | TypeScript 类型安全 |
| 5 | chalk | 5.x | 终端美化 | 彩色输出提示 |
| 6 | pandoc | 3.x | Markdown 解析 | 外部依赖，需安装 |
| 7 | typst | 0.11+ | PDF 编译 | 外部依赖，需安装 |
| 8 | typescript | 5.x | 类型系统 | 开发依赖 |
| 9 | `@types/node` | 22.x | Node 类型 | 开发依赖 |
| 10 | `@types/fs-extra` | 11.x | fs-extra 类型 | 开发依赖 |

## 8. 标题接近页尾测试

这一节用来测试"标题不孤立在页尾"的效果。Typst 的 `sticky: true` 属性会让标题尽量与后续内容保持在同一页，避免标题孤立在页面底部后面跟着空白的情况。

### 8.1 子标题测试

这是子标题后的正文内容，用于验证标题和正文的绑定效果。如果标题出现在页面底部且下面没有足够空间放置内容，Typst 会自动将标题移到下一页。

### 8.2 另一个子标题

更多内容，用于填充页面，触发分页测试。在实际使用中，写作者无需手动控制分页——工具会自动处理这些排版细节。

## 9. 总结

**md-to-beautiful-pdf** 是一个让 Markdown 写作者获得高质量 PDF 输出的工具：

- **写作体验不变**：继续用 Typora 或任何 Markdown 编辑器写作
- **分页质量提升**：Typst 精排引擎处理所有分页细节
- **主题可扩展**：内置 `minimal` 和 `purple` 主题，后续可添加更多
- **一条命令搞定**：`mdpdf input.md` 即可生成高质量 PDF

> 本项目开源，欢迎贡献主题和改进分页逻辑。
