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
| `canofold-markdown` | Write or revise Markdown, MDX, and rich directives | Installed version, configuration, existing content, and build results |
| `canofold-docs-from-code` | Maintain docs and examples from verified code changes | Actual implementation, public interfaces, tests, and change scope |
| `canofold-knowledge-reader` | Answer from static knowledge output with page citations | Site output, locale and version scope, original text, and source links |

Author with the project's syntax, maintain docs against real code, and retain page sources when reading. All three tasks work with the same knowledge files.

## Integration

Get the complete `skills/<name>/` directory from the repository and follow the [installation instructions](https://github.com/canofold/skills/blob/main/README.md) to place it in a Skills location supported by your agent. Keep `SKILL.md` together with the reference files it uses. Follow your agent's instructions for installation paths and loading.

Example tasks:

```text
Use canofold-markdown to write an installation page with Tabs for this project.
Use canofold-docs-from-code to update docs and examples for this public API change.
Use canofold-knowledge-reader to answer only from this site's current English docs and cite pages.
```

Installation paths, invocation, and automatic selection belong to the agent host. The CLI compiles content, the VS Code extension previews it, and your agent loads Skills.

## Boundaries

- Follow the target project's version and configuration, not syntax from development branches or unrelated versions.
- Review agent suggestions. Run `canofold check`, builds, and real previews after authoring.
- State missing evidence, unavailable source text, or conflicting sources instead of inventing facts or citations.
- Skills do not bundle an AI model, permissions system, or long-term memory service. Models, tool permissions, and data transmission depend on the host and services you use.

Related: [Canofold's goal and current capabilities](/en/guide/introduction/what-is-canofold/), [AI-friendly output](/en/reference/output/ai-output/), and [VS Code preview](/en/vscode/).
