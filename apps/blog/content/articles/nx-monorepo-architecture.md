---
title: 'Nx Boundaries Without Premature Libraries'
description: 'How to grow an Nx monorepo with explicit application boundaries while waiting for genuine shared platform needs.'
publishedAt: '2026-08-10'
status: 'draft'
tags:
  - nx
  - architecture
  - angular
---

# Nx Boundaries Without Premature Libraries

Nx makes it easy to create libraries. That is also how monorepos accumulate empty packages.

## The rule

Create a library when there is:

1. A real second consumer, or
2. A clearly documented platform responsibility

Until then, keep Blog-specific code in `apps/blog`.

## Example workspace tags (conceptual)

Dependency constraints can wait until tags mean something. A minimal mental model:

```json
{
  "projects": {
    "portfolio": { "tags": ["type:app", "scope:portfolio"] },
    "blog": { "tags": ["type:app", "scope:blog"] }
  }
}
```

Enforcing `scope:blog` → `scope:portfolio` as forbidden is useful _after_ both apps exist and the temptation to import across them appears.

## What Blog owns today

Blog owns its:

- Routes (`/`, `/:slug`)
- Layout shell
- Future content under `content/articles/`

Portfolio remains untouched production code.

## Drafts

This article is intentionally marked `draft`. Production builds should ignore it later; local authoring can still keep the file in Git.

_Drafts are a frontmatter concern—not an Admin product—for V1._
