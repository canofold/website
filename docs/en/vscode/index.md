---
title: VS Code extension
seoTitle: Canofold VS Code Extension | Markdown Preview & Project Checks
description: Preview Markdown, math and diagrams in VS Code. Check documentation with your project's local Canofold CLI, locate Problems, fix them and check again.
group: Editor Extension
order: 40
---

# VS Code extension

Canofold Markdown Preview brings Canofold's Markdown rendering to your editor. Read documents and inspect diagrams in the current tab, then return to source without creating a documentation site first.

In a Canofold project, you can also run documentation checks, locate issues in Problems, and check again after editing. Preview handles reading; the project's CLI owns validation. Each retains its own content and configuration boundaries.

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

## Check project documentation

Starting with extension **0.2.0**, open the Command Palette from a project file and run **Canofold: Check Project**:

1. Open the local project folder in VS Code and install dependencies through its normal workflow. The project must declare `canofold` in `dependencies` or `devDependencies`.
2. Save that project's edits and run the command. The extension searches upward from the current file for the nearest Canofold project inside the workspace, then executes its installed `canofold check --json`.
3. Review errors and warnings in **Problems**, click an issue with a source location to navigate, then fix, save, and run the check again.

Checks require a trusted workspace because the CLI executes project configuration and plugins. The extension host must run Node.js **22.12** or later; update VS Code if it does not. Standalone Markdown preview does not require a project CLI and remains available when checks cannot run.

The command reads saved files only. It does not save edits, install tools from the network, or use a global CLI. Rules and results come from the project's installed CLI, not a second validator in the extension. Unsaved changes prevent checking; editing project files clears obsolete results, so save and check again.

Cancel from the progress notification. Re-running replaces obsolete work; different projects retain separate diagnostics. A multi-root workspace without a file context prompts you to choose a folder. This is not automatic whole-site validation on every keystroke.

Only CLI-supplied source lines and columns are used for navigation; a line-only location is labeled accordingly. Project-level issues, missing source files, and OpenAPI pointers explicitly state that no exact source position is available. Generated-content positions are not presented as specification locations. A passing check does not replace a production build; [build and preview](/en/guide/delivery/build-preview/) before publishing.

## File and security boundaries

The extension takes `.md` files as input. Files such as `SKILL.md` remain Markdown even when VS Code assigns a specialized language. Preview displays the document; it does not execute Skill instructions or MDX code, or load a Skill for an agent.

Raw HTML is sanitized. Unknown or invalid rich directives display as inert source so surrounding content remains readable. This does not suppress all plugin failures.

Local iframes display static content without scripts or same-origin access. CSS, images, fonts, and other resources are restricted to the workspace and its public directory; symbolic links are not followed. Remote iframes require HTTPS and remain subject to the target site's framing policy.

Editor preview is not a complete site build. Navigation, locale and version routes, search indexes, and build extensions remain the responsibility of project configuration and the CLI. Run [content checks and builds](/en/guide/delivery/) before publishing.

## Help and development

See the [GitHub repository](https://github.com/canofold/vscode) for source, development commands, tests, and detailed resource limits. Use the [Markdown SDK](/en/markdown/usage/) to embed rendering in an application, or explore [Skills](/en/skills/) for agent-assisted content maintenance.
