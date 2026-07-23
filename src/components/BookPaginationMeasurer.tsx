import { useLayoutEffect, useRef } from 'react'
import type { MarkdownBlock, MarkdownBookPage } from '../lib/books'
import { MarkdownBlockView } from './LightMarkdownPage'

type Props = {
  pages: MarkdownBookPage[]
  preserveSpreads: boolean
  onPagesChange: (pages: MarkdownBookPage[]) => void
}

type MeasuredBlock = {
  block: MarkdownBlock
  height: number
}

const numericStyle = (value: string) => Number.parseFloat(value) || 0

function outerHeight(element: Element) {
  const style = window.getComputedStyle(element)
  return (element as HTMLElement).offsetHeight
    + numericStyle(style.marginTop)
    + numericStyle(style.marginBottom)
}

function splitOversizedList(block: MarkdownBlock, element: Element, capacity: number): MeasuredBlock[] | null {
  if (block.type !== 'list') return null

  const items = Array.from(element.querySelectorAll(':scope > li'))
  if (items.length < 2) return null

  const elementStyle = window.getComputedStyle(element)
  const listOverhead = numericStyle(elementStyle.marginTop)
    + numericStyle(elementStyle.marginBottom)
    + numericStyle(elementStyle.paddingTop)
    + numericStyle(elementStyle.paddingBottom)
    + numericStyle(elementStyle.borderTopWidth)
    + numericStyle(elementStyle.borderBottomWidth)

  const chunks: MeasuredBlock[] = []
  let chunkItems: string[] = []
  let chunkHeight = listOverhead

  block.items.forEach((item, index) => {
    const itemHeight = outerHeight(items[index])
    if (chunkItems.length > 0 && chunkHeight + itemHeight > capacity) {
      chunks.push({
        block: { ...block, items: chunkItems },
        height: chunkHeight,
      })
      chunkItems = []
      chunkHeight = listOverhead
    }
    chunkItems.push(item)
    chunkHeight += itemHeight
  })

  if (chunkItems.length > 0) {
    chunks.push({
      block: { ...block, items: chunkItems },
      height: chunkHeight,
    })
  }

  return chunks
}

function paginateBlocks(blocks: MarkdownBlock[], elements: Element[], capacity: number): MarkdownBlock[][] {
  const measured = blocks.flatMap<MeasuredBlock>((block, index) => {
    const element = elements[index]
    if (!element) return [{ block, height: 0 }]
    const height = outerHeight(element)
    if (height <= capacity) return [{ block, height }]
    return splitOversizedList(block, element, capacity) ?? [{ block, height }]
  })

  const pages: MarkdownBlock[][] = []
  let current: MarkdownBlock[] = []
  let usedHeight = 0

  const flush = () => {
    if (current.length === 0) return
    pages.push(current)
    current = []
    usedHeight = 0
  }

  measured.forEach((entry, index) => {
    if (entry.block.type === 'pageBreak') {
      flush()
      return
    }

    const nextHeight = measured[index + 1]?.height ?? 0
    const keepWithNext = entry.block.type === 'heading' && nextHeight > 0
    const requiredHeight = entry.height + (keepWithNext ? nextHeight : 0)

    if (current.length > 0 && usedHeight + requiredHeight > capacity) flush()
    if (current.length > 0 && usedHeight + entry.height > capacity) flush()

    current.push(entry.block)
    usedHeight += entry.height
  })

  flush()
  return pages.length > 0 ? pages : [[]]
}

function buildPaginatedBook(
  sourcePages: MarkdownBookPage[],
  probes: HTMLElement[],
  capacity: number,
  preserveSpreads: boolean,
) {
  const output: MarkdownBookPage[] = []
  let contentIndex = 0

  sourcePages.forEach((page) => {
    if (page.kind === 'blank') return

    if (page.kind === 'chapter') {
      if (preserveSpreads && output.length % 2 === 0) output.push({ kind: 'blank' })
      output.push(page)
      return
    }

    const probe = probes[contentIndex]
    const elements = probe ? Array.from(probe.children) : []
    const chunks = paginateBlocks(page.blocks, elements, capacity)
    chunks.forEach((blocks) => {
      output.push({ ...page, blocks })
    })
    contentIndex += 1
  })

  return output
}

export default function BookPaginationMeasurer({ pages, preserveSpreads, onPagesChange }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<() => void>(() => undefined)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const style = window.getComputedStyle(viewport)
        const capacity = viewport.clientHeight
          - numericStyle(style.paddingTop)
          - numericStyle(style.paddingBottom)
        if (capacity <= 0) return

        const probes = Array.from(viewport.querySelectorAll<HTMLElement>('[data-pagination-probe]'))
        onPagesChange(buildPaginatedBook(pages, probes, capacity, preserveSpreads))
      })
    }
    measureRef.current = measure

    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    viewport.querySelectorAll('[data-pagination-probe]').forEach((probe) => observer.observe(probe))
    document.fonts?.ready.then(measure)
    measure()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      measureRef.current = () => undefined
    }
  }, [onPagesChange, pages, preserveSpreads])

  const contentPages = pages.filter((page): page is Extract<MarkdownBookPage, { kind: 'content' }> => page.kind === 'content')

  return (
    <section className="folio-pagination-measurer folio-leaf folio-leaf-left folio-content-page" aria-hidden="true">
      <div ref={viewportRef} className="folio-markdown-flow folio-pagination-viewport">
        {contentPages.map((page, pageIndex) => (
          <div className="folio-pagination-probe" data-pagination-probe key={`${page.title}-${pageIndex}`}>
            {page.blocks.map((block, blockIndex) => (
              <MarkdownBlockView
                block={block}
                eagerImages
                onImageLoad={() => measureRef.current()}
                key={`${block.type}-${blockIndex}`}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
