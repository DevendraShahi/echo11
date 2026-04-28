export type ContractContentBlockType =
  | 'spacer'
  | 'heading'
  | 'clause'
  | 'subclause'
  | 'bullet'
  | 'paragraph'
  | 'signature'

export interface ContractContentBlock {
  type: ContractContentBlockType
  text: string
  index?: string
}

const CLAUSE_PATTERN = /^(\d+)\.\s+(.+)$/
const SUBCLAUSE_PATTERN = /^([a-zA-Z])\)\s+(.+)$/
const BULLET_PATTERN = /^[-•]\s+(.+)$/
const SIGNATURE_PATTERN = /^_{4,}.*$/

function isUpperHeading(line: string): boolean {
  if (line.length < 4 || line.length > 80) return false
  return /^[A-Z0-9][A-Z0-9\s/&(),:'"-]+$/.test(line)
}

function isLabelHeading(line: string): boolean {
  if (line.length < 4 || line.length > 60) return false
  return /^[A-Z][A-Za-z0-9\s/&()-]+:$/.test(line)
}

export function parseContractContent(content: string): ContractContentBlock[] {
  if (!content) return []

  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const blocks: ContractContentBlock[] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      if (blocks.length > 0 && blocks[blocks.length - 1].type !== 'spacer') {
        blocks.push({ type: 'spacer', text: '' })
      }
      continue
    }

    if (SIGNATURE_PATTERN.test(line)) {
      blocks.push({ type: 'signature', text: line })
      continue
    }

    const clauseMatch = line.match(CLAUSE_PATTERN)
    if (clauseMatch) {
      blocks.push({
        type: 'clause',
        index: `${clauseMatch[1]}.`,
        text: clauseMatch[2].trim(),
      })
      continue
    }

    const subclauseMatch = line.match(SUBCLAUSE_PATTERN)
    if (subclauseMatch) {
      blocks.push({
        type: 'subclause',
        index: `${subclauseMatch[1]})`,
        text: subclauseMatch[2].trim(),
      })
      continue
    }

    const bulletMatch = line.match(BULLET_PATTERN)
    if (bulletMatch) {
      blocks.push({ type: 'bullet', text: bulletMatch[1].trim() })
      continue
    }

    if (isUpperHeading(line) || isLabelHeading(line)) {
      blocks.push({ type: 'heading', text: line })
      continue
    }

    blocks.push({ type: 'paragraph', text: line })
  }

  if (blocks[blocks.length - 1]?.type === 'spacer') {
    blocks.pop()
  }

  return blocks
}
