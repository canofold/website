---
title: VS Code extension
seoTitle: Canofold VS Code Extension | Live Markdown, Math & Diagrams
description: Install Canofold Markdown Preview to switch source and live preview in the current VS Code tab, with math, Mermaid and other diagrams, and restricted iframes.
group: VS Code
order: 40
sidebar: false
---

# VS Code extension

Canofold Markdown Preview brings Canofold's Markdown rendering to your editor. Read documents and inspect diagrams in the current tab, then return to source without creating a documentation site first.

## Install and open

Requires VS Code 1.100 or later. Search Extensions for **Canofold Markdown Preview** and verify the publisher is `canofold`, or install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=canofold.canofold-vscode).

1. Open a saved `.md` file.
2. Click the Canofold icon in the editor title bar, or run **Canofold: Toggle Canofold Preview** from the Command Palette.
3. Run the same command to return to source. **Canofold: Preview with Canofold** and **Canofold: Edit Markdown Source** provide explicit one-way commands.

This optional editor does not replace VS Code's default Markdown editor. Switching into preview saves dirty source first. Once a preview is open, unsaved document changes also update it live.

## What it renders

- Markdown prose, code, tables, images, and Canofold rich directives.
- Math, Mermaid, PlantUML, Graphviz/DOT, and D2 diagrams.
- Relative images, links, and static HTML iframes within the workspace.

Diagrams render locally without sending source to public rendering services. The preview uses a light appearance independently of the editor theme. YAML frontmatter is not displayed as body content.

## File and security boundaries

The extension takes `.md` files as input. Files such as `SKILL.md` remain Markdown even when VS Code assigns a specialized language. Preview displays the document; it does not execute Skill instructions or MDX code, or load a Skill for an agent.

Raw HTML is sanitized. Unknown or invalid rich directives display as inert source so surrounding content remains readable. This does not suppress all plugin failures.

Local iframes display static content without scripts or same-origin access. CSS, images, fonts, and other resources are restricted to the workspace and its public directory; symbolic links are not followed. Remote iframes require HTTPS and remain subject to the target site's framing policy.

Editor preview is not a complete site build. Navigation, locale and version routes, search indexes, and build extensions remain the responsibility of project configuration and the CLI. Run [content checks and builds](/en/guide/delivery/) before publishing.

## Help and development

See the [GitHub repository](https://github.com/canofold/vscode) for source, development commands, tests, and detailed resource limits. Use the [Markdown SDK](/en/markdown/usage/) to embed rendering in an application, or explore [Skills](/en/skills/) for agent-assisted content maintenance.
