---
title: Canofold Skills
seoTitle: Canofold Skills | Agent-Assisted Markdown & Knowledge Reading
description: Explore experimental Canofold Agent Skills for project-aware Markdown authoring, documentation updates from code, and source-cited answers from versioned knowledge output.
group: Skills
order: 50
---

# Canofold Skills

Write a guide, document an API change, or find an answer with a source: Canofold Skills give agents a workflow for these tasks. They inspect the project's actual version, configuration, and source files before creating, maintaining, or using knowledge.

Skills are public in the [Canofold Skills repository](https://github.com/canofold/skills) and remain experimental. Install them individually for the tasks below. Try one on a real document before adding it to your daily workflow.

## Tasks

| Skill | Task | Evidence to check |
|---|---|---|
| [`canofold-markdown`](https://github.com/canofold/skills/tree/main/skills/canofold-markdown) | Write or revise Markdown, MDX, and rich directives | Installed version, configuration, existing content, and build results |
| [`canofold-docs-from-code`](https://github.com/canofold/skills/tree/main/skills/canofold-docs-from-code) | Maintain docs and examples from verified code changes | Actual implementation, public interfaces, tests, and change scope |
| [`canofold-knowledge-reader`](https://github.com/canofold/skills/tree/main/skills/canofold-knowledge-reader) | Answer from static knowledge output with page citations | Site output, locale and version scope, original text, and source links |

Author with the project's syntax, maintain docs against real code, and retain page sources when reading. All three tasks work with the same knowledge files.

## Integration

Get the complete `skills/<name>/` directory from the repository and follow the [installation instructions](https://github.com/canofold/skills/blob/main/README.md) to place it in a Skills location supported by your agent. Keep `SKILL.md`, `references/` and `scripts/` where present, not just the entry file. Follow your agent's instructions for installation paths and loading.

Bundled references target Canofold 0.8.2, including direct-array `versions`, content snapshots and build-time OpenAPI sources. For another version, Skills check that project's contract rather than applying newer syntax unchanged. Installed copies do not update automatically with Core npm packages, the VS Code extension or the Website. Replace the complete Skill directory when updating and record the repository commit used.

Example tasks:

```text
Use canofold-markdown to write an installation page with Tabs for this project.
Use canofold-docs-from-code to update docs and examples for this public API change.
Use canofold-knowledge-reader to answer only from this site's current English docs and cite pages.
```

Installation paths, invocation, and automatic selection belong to the agent host. The CLI compiles content, the VS Code extension previews it, and your agent loads Skills.

## Read site knowledge

The independent Knowledge Reader reference script needs only Node.js 22+ and no Core runtime dependency; building a Canofold 0.8 site requires Node.js 22.12+. It validates the schema 3 manifest, index and content shards before reconstructing Markdown, MDX or derived bodies. OpenAPI is the official derived source; custom `ContentSource` kinds use the same derived envelope, while adapter-specific facts retain the semantics documented by their adapter.

For example, after obtaining the complete `canofold-knowledge-reader` directory, read an installation guide from a local site build:

```sh
node path/to/canofold-knowledge-reader/scripts/read-page.mjs .canofold/dist /en/guide/introduction/installation/
```

Replace the output directory and route with actual values for the target site; remote roots must include their deployment prefix. Use a matching earlier Reader or available HTML/Markdown for schema 1/2 sites. Establish a new trusted baseline after a format upgrade; a format change is not content deletion. See [AI-friendly output](/en/reference/output/ai-output/) for full reads, snapshot comparison and failure handling.

## Boundaries

- Follow the target project's version and configuration, not syntax from development branches or unrelated versions.
- Do not write current-only behavior into historical snapshots. Maintain generated facts such as OpenAPI parameters in their specification rather than copying another table into authored docs.
- Review agent suggestions. Run `canofold check`, builds, and real previews after authoring.
- State missing evidence, unavailable source text, or conflicting sources instead of inventing facts or citations.
- Skills do not bundle an AI model, permissions system, or long-term memory service. Models, tool permissions, and data transmission depend on the host and services you use.

Related: [Canofold's goal and current capabilities](/en/guide/introduction/what-is-canofold/), [AI-friendly output](/en/reference/output/ai-output/), and [VS Code preview](/en/vscode/).
