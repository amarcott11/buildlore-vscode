<p align="center">
  <img src="images/icon.png" width="128" alt="BuildLore logo">
</p>

<h1 align="center">BuildLore — Styled Markdown Preview</h1>

<p align="center">
  Preview your markdown with 13 professional templates. One-click template switching, live preview, and HTML export — all inside VS Code.
</p>

---

![Preview side by side](images/screenshot-preview.png)

## Features

- **13 Built-in Templates** — Standard, Manuscript, Briefing, Scholar, Journal, Dispatch, Handbook, Midnight, Blueprint, Canvas, Folio, Protocol, and Ink
- **Live Preview** — See styled output update as you type
- **One-Click Template Switching** — Quickly swap between templates via the command palette or status bar
- **HTML Export** — Export your styled markdown as a standalone HTML file
- **Per-Project Config** — Drop a `.buildlore.json` in your project root to set a default template

## Template Gallery

| | | |
|---|---|---|
| ![Standard](images/template-standard.png) | ![Manuscript](images/template-manuscript.png) | ![Briefing](images/template-briefing.png) |
| Standard | Manuscript | Briefing |
| ![Scholar](images/template-scholar.png) | ![Journal](images/template-journal.png) | ![Dispatch](images/template-dispatch.png) |
| Scholar | Journal | Dispatch |
| ![Handbook](images/template-handbook.png) | ![Midnight](images/template-midnight.png) | ![Blueprint](images/template-blueprint.png) |
| Handbook | Midnight | Blueprint |
| ![Canvas](images/template-canvas.png) | ![Folio](images/template-folio.png) | ![Protocol](images/template-protocol.png) |
| Canvas | Folio | Protocol |
| ![Ink](images/template-ink.png) | | |
| Ink | | |

## Usage

1. Open any `.md` file
2. Run **BuildLore: Open Preview to Side** from the command palette (`Ctrl+K B`)
3. Switch templates with **BuildLore: Select Template** or click `BL: [Template]` in the status bar
4. Export with **BuildLore: Export as HTML**

## Commands

| Command | Description |
|---------|-------------|
| `BuildLore: Open Styled Preview` | Open preview in the current editor group |
| `BuildLore: Open Preview to Side` | Open preview in a side panel |
| `BuildLore: Select Template` | Pick from 13 templates |
| `BuildLore: Export as HTML` | Save styled output as an HTML file |

## Project Configuration

Create a `.buildlore.json` in your workspace root:

```json
{
  "template": "Standard"
}
```

## License

MIT
