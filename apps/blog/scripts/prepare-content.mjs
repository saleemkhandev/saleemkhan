/**
 * Blog build-time content pipeline.
 *
 * Discovers Markdown under apps/blog/content/articles/, validates
 * frontmatter/slugs, renders HTML with Marked, highlights code with Shiki,
 * and writes typed modules under apps/blog/src/app/generated/.
 *
 * Presentation code must not import this script or read Markdown files.
 */

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import matter from 'gray-matter';
import { marked } from 'marked';
import { createHighlighter } from 'shiki';

import {
  assertValidSlug,
  ContentValidationError,
  validateFrontmatter,
} from './lib/content-validation.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(blogRoot, '../..');
const articlesDir = path.join(blogRoot, 'content/articles');
const generatedRoot = path.join(blogRoot, 'src/app/generated');
const generatedArticlesDir = path.join(generatedRoot, 'articles');
const generatedSeoDir = path.join(generatedRoot, 'seo');

/** Public production URLs — must match Blog site constants. */
const PUBLIC_DOMAIN = 'https://saleemkhan.dev';
const PUBLIC_BLOG_BASE = `${PUBLIC_DOMAIN}/blog`;

const SHIKI_LANGS = [
  'typescript',
  'javascript',
  'json',
  'html',
  'css',
  'scss',
  'bash',
  'yaml',
  'markdown',
  'text',
];

const SHIKI_THEME = 'github-dark';

const LANG_ALIASES = {
  ts: 'typescript',
  js: 'javascript',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  md: 'markdown',
};

/**
 * @typedef {{
 *   filePath: string;
 *   relativePath: string;
 *   slug: string;
 *   title: string;
 *   description: string;
 *   publishedAt: string;
 *   status: 'draft' | 'published';
 *   tags: string[];
 *   body: string;
 *   contentHtml: string;
 * }} PreparedArticle
 */

/**
 * @param {import('shiki').Highlighter} highlighter
 */
function configureMarked(highlighter) {
  const loadedLanguages = new Set(highlighter.getLoadedLanguages());

  marked.use({
    gfm: true,
    breaks: false,
    renderer: {
      html() {
        // Trust boundary: Git-owned Markdown only. Raw HTML is stripped so
        // presentation never receives author-supplied markup tags.
        return '';
      },
      code({ text, lang }) {
        const requested = (lang ?? '').trim().toLowerCase();
        const aliased = LANG_ALIASES[requested] ?? requested;
        const language = loadedLanguages.has(aliased) ? aliased : 'text';

        return highlighter.codeToHtml(text, {
          lang: language,
          theme: SHIKI_THEME,
        });
      },
    },
  });
}

/**
 * @param {string} markdown
 * @param {string} relativePath
 */
async function renderMarkdown(markdown, relativePath) {
  try {
    return await marked.parse(markdown, { async: true });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new ContentValidationError(
      relativePath,
      `Unable to render Markdown (${reason})`,
      'body',
    );
  }
}

/**
 * @returns {Promise<PreparedArticle[]>}
 */
async function prepareArticles() {
  let entries;
  try {
    entries = await readdir(articlesDir, { withFileTypes: true });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Blog content discovery failed for ${path.relative(workspaceRoot, articlesDir)}: ${reason}`,
    );
  }

  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort();

  if (markdownFiles.length === 0) {
    throw new Error(
      `Blog content discovery failed: no Markdown files found in ${path.relative(workspaceRoot, articlesDir)}`,
    );
  }

  const highlighter = await createHighlighter({
    themes: [SHIKI_THEME],
    langs: SHIKI_LANGS,
  });
  configureMarked(highlighter);

  /** @type {Map<string, string>} */
  const slugOwners = new Map();
  /** @type {PreparedArticle[]} */
  const articles = [];

  for (const fileName of markdownFiles) {
    const filePath = path.join(articlesDir, fileName);
    const relativePath = path.relative(workspaceRoot, filePath);
    const slug = fileName.replace(/\.md$/i, '');

    assertValidSlug(relativePath, slug);

    const existingOwner = slugOwners.get(slug);
    if (existingOwner) {
      throw new Error(
        `Blog content validation failed:\nDuplicate slug "${slug}"\nConflicting files:\n- ${existingOwner}\n- ${relativePath}`,
      );
    }
    slugOwners.set(slug, relativePath);

    const raw = await readFile(filePath, 'utf8');

    let parsed;
    try {
      parsed = matter(raw);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new ContentValidationError(
        relativePath,
        `Invalid Markdown/frontmatter structure (${reason})`,
      );
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new ContentValidationError(
        relativePath,
        'Invalid Markdown/frontmatter structure',
      );
    }

    const metadata = validateFrontmatter(
      relativePath,
      /** @type {Record<string, unknown>} */ (parsed.data),
    );
    const body = typeof parsed.content === 'string' ? parsed.content : '';

    if (body.trim().length === 0) {
      throw new ContentValidationError(
        relativePath,
        'Markdown body must not be empty',
        'body',
      );
    }

    const contentHtml = await renderMarkdown(body, relativePath);
    if (typeof contentHtml !== 'string' || contentHtml.trim().length === 0) {
      throw new ContentValidationError(
        relativePath,
        'Markdown rendering produced empty HTML',
        'body',
      );
    }

    articles.push({
      filePath,
      relativePath,
      slug,
      ...metadata,
      body,
      contentHtml,
    });
  }

  highlighter.dispose();

  return articles.sort((left, right) => {
    if (left.publishedAt === right.publishedAt) {
      return left.slug.localeCompare(right.slug);
    }
    return right.publishedAt.localeCompare(left.publishedAt);
  });
}

/**
 * @param {PreparedArticle[]} articles
 */
async function writeGeneratedOutput(articles) {
  await rm(generatedRoot, { recursive: true, force: true });
  await mkdir(generatedArticlesDir, { recursive: true });

  const manifest = articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    description: article.description,
    publishedAt: article.publishedAt,
    status: article.status,
    tags: article.tags,
  }));

  const manifestSource = `/**
 * AUTO-GENERATED FILE. DO NOT EDIT.
 * Generated by apps/blog/scripts/prepare-content.mjs
 */
import type { ArticleSummary } from '../core/models/article';

export const ARTICLE_MANIFEST = ${JSON.stringify(
    manifest,
    null,
    2,
  )} as const satisfies readonly ArticleSummary[];
`;

  await writeFile(
    path.join(generatedRoot, 'articles.manifest.ts'),
    manifestSource,
    'utf8',
  );

  for (const article of articles) {
    const articlePayload = {
      slug: article.slug,
      title: article.title,
      description: article.description,
      publishedAt: article.publishedAt,
      status: article.status,
      tags: article.tags,
      contentHtml: article.contentHtml,
    };

    const articleSource = `/**
 * AUTO-GENERATED FILE. DO NOT EDIT.
 * Generated by apps/blog/scripts/prepare-content.mjs
 * Source: ${article.relativePath}
 */
import type { Article } from '../../core/models/article';

export const article = ${JSON.stringify(
      articlePayload,
      null,
      2,
    )} as const satisfies Article;
`;

    await writeFile(
      path.join(generatedArticlesDir, `${article.slug}.data.ts`),
      articleSource,
      'utf8',
    );
  }

  const registryImports = articles
    .map((article, index) => {
      const exportName = `article_${index}`;
      return `import { article as ${exportName} } from './articles/${article.slug}.data';`;
    })
    .join('\n');

  const registryEntries = articles
    .map((article, index) => {
      const exportName = `article_${index}`;
      return `  '${article.slug}': ${exportName},`;
    })
    .join('\n');

  const registrySource = `/**
 * AUTO-GENERATED FILE. DO NOT EDIT.
 * Generated by apps/blog/scripts/prepare-content.mjs
 *
 * Aggregates full articles for the Blog-local repository.
 * Prefer ARTICLE_MANIFEST for list/discovery to avoid coupling list UI
 * to article bodies at the type level; the bundler may still share chunks.
 */
import type { Article } from '../core/models/article';
${registryImports}

export const ARTICLES_BY_SLUG = {
${registryEntries}
} as const satisfies Record<string, Article>;
`;

  await writeFile(
    path.join(generatedRoot, 'articles.registry.ts'),
    registrySource,
    'utf8',
  );
}

/**
 * @param {string} value
 */
function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/**
 * Sitemap + RSS from the same prepared article list (published only).
 * Written under generated/seo and copied into the static browser output
 * via Angular assets — avoids duplicating article discovery.
 *
 * @param {PreparedArticle[]} articles
 */
async function writeDiscoveryFeeds(articles) {
  await mkdir(generatedSeoDir, { recursive: true });

  const published = articles.filter(
    (article) => article.status === 'published',
  );

  const sitemapUrls = [
    {
      loc: `${PUBLIC_BLOG_BASE}/`,
      lastmod: published[0]?.publishedAt,
    },
    ...published.map((article) => ({
      loc: `${PUBLIC_BLOG_BASE}/${article.slug}`,
      lastmod: article.publishedAt,
    })),
  ];

  const sitemapBody = sitemapUrls
    .map((entry) => {
      const lastmod = entry.lastmod
        ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`
        : '';
      return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmod}\n  </url>`;
    })
    .join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapBody}
</urlset>
`;

  await writeFile(
    path.join(generatedSeoDir, 'sitemap.xml'),
    sitemapXml,
    'utf8',
  );

  const buildDate = new Date().toUTCString();
  const rssItems = published
    .map((article) => {
      const link = `${PUBLIC_BLOG_BASE}/${article.slug}`;
      const pubDate = new Date(
        `${article.publishedAt}T00:00:00.000Z`,
      ).toUTCString();
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${escapeXml(pubDate)}</pubDate>
      <description>${escapeXml(article.description)}</description>
    </item>`;
    })
    .join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Saleem Khan · Engineering Blog</title>
    <link>${escapeXml(`${PUBLIC_BLOG_BASE}/`)}</link>
    <description>Engineering blog by Saleem Khan — articles on frontend architecture, Angular, Nx, and software engineering.</description>
    <language>en-us</language>
    <lastBuildDate>${escapeXml(buildDate)}</lastBuildDate>
${rssItems}
  </channel>
</rss>
`;

  await writeFile(path.join(generatedSeoDir, 'rss.xml'), rssXml, 'utf8');
}

async function main() {
  console.log('Preparing Blog content…');
  console.log(`Articles: ${path.relative(workspaceRoot, articlesDir)}`);

  const articles = await prepareArticles();
  await writeGeneratedOutput(articles);
  await writeDiscoveryFeeds(articles);

  const publishedCount = articles.filter(
    (a) => a.status === 'published',
  ).length;

  console.log(
    `Generated ${articles.length} article module(s) → ${path.relative(workspaceRoot, generatedRoot)}`,
  );
  console.log(
    `Generated sitemap.xml + rss.xml for ${publishedCount} published article(s)`,
  );

  for (const article of articles) {
    console.log(`  - ${article.slug} [${article.status}]`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
