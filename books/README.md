# Bilingual portfolio content

The LED portfolio reads `work.md`, `research.md`, and `patents.md` from `books/en` and `books/zh`. The other Markdown files in those directories are archived drafts.

Use a level-one heading to group entries and level-two headings for individual entries.

```md
# Research

## Project title

Project description and [paper link](https://example.com).
```

Headings from level three onward stay inside the entry. The renderer supports paragraphs, lists, blockquotes, images, emphasis, links, and inline code. A line containing only `---` separates text blocks. The display fits content to the available screen and paginates it at runtime.
