# Blog Search

Search blog posts on Alex MacArthur's website using the built-in search index.

## Usage

The site provides client-side search powered by Pagefind. To search programmatically:

1. Load the search index from `https://macarthur.me/pagefind/pagefind.js`
2. Call `pagefind.search(query)` to find matching posts
3. Access results with `result.data.url`, `result.data.title`, `result.data.meta.description`

## See Also

- Blog Content Skill: https://macarthur.me/.well-known/agent-skills/blog-content/SKILL.md
- RSS Feed: https://macarthur.me/rss/feed.xml