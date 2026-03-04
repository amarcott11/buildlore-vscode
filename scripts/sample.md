---
title: "BuildLore Style Guide"
author: "BuildLore Team"
date: "2025-01-15"
description: "A showcase of all supported markdown elements"
keywords: "markdown, templates, preview"
---

# BuildLore Style Guide

This document showcases every element that BuildLore templates can style. Use it as a reference when designing your own documents.

## Typography & Text

Paragraphs render with the template's chosen font family, size, and line height. **Bold text** and *italic text* work as expected, along with ~~strikethrough~~ and `inline code` for technical terms like `useState()` or `docker compose up`.

Here's a second paragraph to demonstrate spacing and density settings. Templates can adjust the gap between paragraphs from compact to airy, and some even enable drop caps on the first paragraph after a heading.

## Code Blocks

```javascript
// Fetch and display user data
async function loadUsers() {
  const res = await fetch('/api/users');
  const users = await res.json();

  return users.map(u => ({
    id: u.id,
    name: `${u.first} ${u.last}`,
    role: u.role ?? 'viewer',
  }));
}
```

```css
/* Theme-aware card component */
.card {
  background: var(--surface);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

## Blockquotes

> "Good design is as little design as possible. Less, but better — because it concentrates on the essential aspects, and the products are not burdened with non-essentials."
>
> — Dieter Rams

## Lists

### Unordered List

- Set up your project structure
- Choose a template that fits your content
- Customize colors, fonts, and spacing
- Export to HTML or print to PDF

### Ordered List

1. Install the BuildLore extension from the marketplace
2. Open any markdown file in VS Code
3. Press `Ctrl+K B` to open the styled preview
4. Select a template from the command palette

## Tables

| Feature          | Free Plan | Pro Plan  | Enterprise |
|------------------|-----------|-----------|------------|
| Templates        | 3         | 13        | Unlimited  |
| Custom Themes    | No        | Yes       | Yes        |
| HTML Export      | Yes       | Yes       | Yes        |
| Priority Support | No        | No        | Yes        |

## Links & Horizontal Rules

Visit the [BuildLore documentation](https://buildlore.com/docs) for more details, or check out the [GitHub repository](https://github.com/buildlore) for source code.

---

## Nested Content

> **Pro tip:** You can nest elements inside blockquotes:
>
> - First item in a quoted list
> - Second item with `inline code`
> - Third item with **bold emphasis**

### Deep Heading Levels

#### Fourth-Level Heading

Content under a fourth-level heading shows how templates handle the full heading hierarchy.

##### Fifth-Level Heading

Even deeper nesting is supported for complex document structures.

## Final Notes

BuildLore transforms plain markdown into professionally styled documents. Each template brings its own personality — from clean technical docs to warm craft-style guides — while keeping your content front and center.
