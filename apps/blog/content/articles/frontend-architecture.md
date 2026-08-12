---
title: 'Frontend Architecture for a Personal Platform'
description: 'A pragmatic layering model for Angular apps that stay thin, avoid speculative libraries, and still leave room to grow.'
publishedAt: '2026-08-05'
status: 'published'
tags:
  - frontend-architecture
  - angular
  - architecture
---

# Frontend Architecture for a Personal Platform

Good personal-platform architecture is mostly about _what you refuse to build early_.

## Preferred layering

Keep the dependency arrow pointing downward:

```text
Apps
  ↓
Feature libraries (when shared)
  ↓
Data-access / UI libraries
  ↓
Utilities
```

For Blog V1, most of that stack still lives **inside** `apps/blog`. That is intentional.

## Principles that actually help

Emphasize these habits:

- Prefer incremental change over speculative frameworks.
- Document decisions as ADRs when they change how the platform evolves.
- Keep presentation free of content-source details.

When content arrives, pages should depend on an article model—not on Markdown paths.

## A small TypeScript contract

Types make the future pipeline honest. A summary is enough for list views:

```ts
export type ArticleStatus = 'draft' | 'published';

export interface ArticleSummary {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  status: ArticleStatus;
  tags: readonly string[];
}
```

Detail views will eventually add rendered HTML. Until then, Markdown remains the authoring format, not a runtime fetch payload.

## What “thin app” means here

A thin app still owns:

1. Routing
2. Layout composition
3. Application-specific wiring

It should not own a fake “enterprise” content platform.

> If removing an abstraction does not hurt a real consumer, the abstraction was early.

Link out when demos belong elsewhere—for example to a future playground—rather than embedding interactive widgets in posts today.
