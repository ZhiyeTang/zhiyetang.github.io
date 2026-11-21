import { Fragment, type ReactNode } from 'react'
import { ArrowUpRight } from '@phosphor-icons/react'
import type { MarkdownBlock } from '../lib/books'

const inlinePattern = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g
const linkPattern = /^\[([^\]]+)\]\((\S+?)(?:\s+["'][^"']+["'])?\)$/

function renderInline(source: string): ReactNode[] {
  return source.split(inlinePattern).filter(Boolean).map((token, index) => {
    const link = token.match(linkPattern)
    if (link) {
      const external = link[2].startsWith('http')
      return (
        <a key={`${token}-${index}`} href={link[2]} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
          <span>{link[1]}</span><ArrowUpRight size={13} weight="light" />
        </a>
      )
    }
    if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      return <strong key={`${token}-${index}`}>{token.slice(2, -2)}</strong>
    }
    if (token.startsWith('`') && token.endsWith('`')) return <code key={`${token}-${index}`}>{token.slice(1, -1)}</code>
    if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
      return <em key={`${token}-${index}`}>{token.slice(1, -1)}</em>
    }
    return <Fragment key={`${token}-${index}`}>{token}</Fragment>
  })
}

export function MarkdownBlockView({ block }: { block: MarkdownBlock }) {
  if (block.type === 'paragraph') return <p>{renderInline(block.content)}</p>
  if (block.type === 'blockquote') return <blockquote><p>{renderInline(block.content)}</p></blockquote>
  if (block.type === 'image') {
    return (
      <figure>
        <img src={block.src} alt={block.alt} />
        {(block.caption || block.alt) && <figcaption>{block.caption || block.alt}</figcaption>}
      </figure>
    )
  }
  if (block.type === 'list') {
    const List = block.ordered ? 'ol' : 'ul'
    return <List>{block.items.map((item, index) => <li key={`${item}-${index}`}>{renderInline(item)}</li>)}</List>
  }
  const Heading = `h${block.level}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  return <Heading>{renderInline(block.content)}</Heading>
}
