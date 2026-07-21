# Book content

The website loads seven books from `books/en` and `books/zh` at build time:

`resume`, `work`, `education`, `research`, `patents`, `notes`, and `selections`.

Each file uses ordinary Markdown headings to define the book structure:

```md
# Chapter

## Title

Markdown content for this title.

## Another title

More content.
```

`# Chapter` always opens alone on a right-hand page. `## Title` starts a new logical page and shares that page with the content that follows it. Headings from `###` to `######` remain inside the content flow.

Content is automatically paginated to fit the rendered book. To force a page break inside a `##` section, put `---` on a line by itself:

```md
Content on the current page.

---

Content that must begin on a new page.
```

The marker itself is not rendered. Content on either side continues to use automatic pagination, and page numbers and running headers are recalculated from the final result.

The lightweight renderer supports links, images, emphasis, inline code, ordered lists, unordered lists, blockquotes, and multi-level headings. Images use normal Markdown syntax:

```md
![Alternative text](/images/example.webp "Optional caption")
```

Keep the filenames unchanged so the corresponding book spine can find them. Raw HTML is intentionally not rendered.
