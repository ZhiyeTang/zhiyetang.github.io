export type Language = 'en' | 'zh'
export type BookKey = 'resume' | 'work' | 'education' | 'research' | 'patents' | 'notes' | 'selections'

export type MarkdownBlock =
  | { type: 'paragraph'; content: string }
  | { type: 'heading'; level: 3 | 4 | 5 | 6; content: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'blockquote'; content: string }
  | { type: 'pageBreak' }

export type MarkdownBookPage =
  | { kind: 'blank' }
  | { kind: 'chapter'; chapter: string }
  | { kind: 'content'; chapter: string; title: string; blocks: MarkdownBlock[] }

const bookKeys: BookKey[] = ['resume', 'work', 'education', 'research', 'patents', 'notes', 'selections']
const markdownFiles = import.meta.glob('../../books/**/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const headingPattern = /^(#{1,6})\s+(.+)$/
const imagePattern = /^!\[([^\]]*)\]\((\S+?)(?:\s+["']([^"']+)["'])?\)$/
const listPattern = /^\s*(?:(\d+)\.|[-*+])\s+(.+)$/

function parseBlocks(lines: string[]): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = []
  let paragraph: string[] = []
  let quote: string[] = []
  let list: { ordered: boolean; items: string[] } | null = null

  const flushParagraph = () => {
    if (!paragraph.length) return
    blocks.push({ type: 'paragraph', content: paragraph.join(' ') })
    paragraph = []
  }
  const flushQuote = () => {
    if (!quote.length) return
    blocks.push({ type: 'blockquote', content: quote.join(' ') })
    quote = []
  }
  const flushList = () => {
    if (!list) return
    blocks.push({ type: 'list', ordered: list.ordered, items: list.items })
    list = null
  }
  const flushAll = () => {
    flushParagraph()
    flushQuote()
    flushList()
  }

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd()
    if (!line.trim()) {
      flushAll()
      return
    }

    if (line.trim() === '---') {
      flushAll()
      blocks.push({ type: 'pageBreak' })
      return
    }

    const heading = line.match(headingPattern)
    if (heading && heading[1].length >= 3) {
      flushAll()
      blocks.push({
        type: 'heading',
        level: Math.min(6, heading[1].length) as 3 | 4 | 5 | 6,
        content: heading[2].trim(),
      })
      return
    }

    const image = line.trim().match(imagePattern)
    if (image) {
      flushAll()
      blocks.push({ type: 'image', alt: image[1], src: image[2], caption: image[3] })
      return
    }

    if (line.trimStart().startsWith('>')) {
      flushParagraph()
      flushList()
      quote.push(line.trimStart().replace(/^>\s?/, ''))
      return
    }

    const listItem = line.match(listPattern)
    if (listItem) {
      flushParagraph()
      flushQuote()
      const ordered = Boolean(listItem[1])
      if (!list || list.ordered !== ordered) {
        flushList()
        list = { ordered, items: [] }
      }
      list.items.push(listItem[2].trim())
      return
    }

    flushQuote()
    flushList()
    paragraph.push(line.trim())
  })

  flushAll()
  return blocks
}

function parseBook(source: string, filePath: string): MarkdownBookPage[] {
  const pages: MarkdownBookPage[] = []
  let chapter = ''
  let title = ''
  let body: string[] = []

  const flushTitlePage = () => {
    if (!title && !body.some((line) => line.trim())) return
    if (!chapter) throw new Error(`Content must follow a level-one chapter heading in ${filePath}`)
    pages.push({
      kind: 'content',
      chapter,
      title: title || chapter,
      blocks: parseBlocks(body),
    })
    title = ''
    body = []
  }

  source.trim().split('\n').forEach((line) => {
    const heading = line.match(headingPattern)
    if (heading?.[1].length === 1) {
      flushTitlePage()
      chapter = heading[2].trim()
      if (pages.length % 2 === 0) pages.push({ kind: 'blank' })
      pages.push({ kind: 'chapter', chapter })
      return
    }
    if (heading?.[1].length === 2) {
      flushTitlePage()
      if (!chapter) throw new Error(`Title must follow a chapter heading in ${filePath}`)
      title = heading[2].trim()
      return
    }
    body.push(line)
  })

  flushTitlePage()
  if (!pages.some((page) => page.kind === 'chapter')) throw new Error(`Missing level-one chapter heading in ${filePath}`)
  return pages
}

export const books = (['en', 'zh'] as const).reduce<Record<Language, Record<BookKey, MarkdownBookPage[]>>>((languages, language) => {
  languages[language] = bookKeys.reduce<Record<BookKey, MarkdownBookPage[]>>((library, book) => {
    const suffix = `/books/${language}/${book}.md`
    const entry = Object.entries(markdownFiles).find(([path]) => path.endsWith(suffix))
    if (!entry) throw new Error(`Missing Markdown book: ${suffix}`)
    library[book] = parseBook(entry[1], entry[0])
    return library
  }, {} as Record<BookKey, MarkdownBookPage[]>)
  return languages
}, {} as Record<Language, Record<BookKey, MarkdownBookPage[]>>)
