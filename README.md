# BuildLore — Styled Markdown Preview

Preview your markdown with 11 professional templates. One-click template switching, live preview, and HTML export — all inside VS Code.

## Features

- **11 Built-in Templates** — Clean Technical, Ebook Modern, Product Guide, Academic, Newsletter, Craft Pattern, Minimal, Dark, Step by Step, Creative Workshop, and the Default theme
- **Live Preview** — See styled output update as you type
- **One-Click Template Switching** — Quickly swap between templates via the command palette
- **HTML Export** — Export your styled markdown as a standalone HTML file
- **Per-Project Config** — Drop a `.buildlore.json` in your project root to set a default template

## Usage

1. Open any `.md` file
2. Run **BuildLore: Open Preview to Side** from the command palette (`Ctrl+K B`)
3. Switch templates with **BuildLore: Select Template**
4. Export with **BuildLore: Export as HTML**

## Commands

| Command | Description |
|---------|-------------|
| `BuildLore: Open Styled Preview` | Open preview in the current editor group |
| `BuildLore: Open Preview to Side` | Open preview in a side panel |
| `BuildLore: Select Template` | Pick from 11 templates |
| `BuildLore: Export as HTML` | Save styled output as an HTML file |

## Project Configuration

Create a `.buildlore.json` in your workspace root:

```json
{
  "template": "Clean Technical"
}
```

## License

MIT
