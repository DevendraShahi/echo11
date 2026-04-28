'use client'

import { parseContractContent } from '@/lib/contract-content'
import { cn } from '@/lib/utils'

interface ContractAgreementPreviewProps {
  content: string
  className?: string
}

export function ContractAgreementPreview({ content, className }: ContractAgreementPreviewProps) {
  const blocks = parseContractContent(content)

  if (blocks.length === 0) {
    return <p className={cn('text-sm text-white/40 font-mono', className)}>No agreement content available.</p>
  }

  return (
    <div className={cn('space-y-3', className)}>
      {blocks.map((block, idx) => {
        if (block.type === 'spacer') {
          return <div key={`spacer-${idx}`} className="h-2" />
        }

        if (block.type === 'heading') {
          return (
            <h4 key={`heading-${idx}`} className="text-[11px] font-mono uppercase tracking-[0.14em] text-accent border-b border-accent/20 pb-1">
              {block.text}
            </h4>
          )
        }

        if (block.type === 'clause') {
          return (
            <div key={`clause-${idx}`} className="flex items-start gap-3">
              <span className="w-9 shrink-0 text-[11px] font-mono text-accent mt-0.5">{block.index}</span>
              <p className="text-sm leading-7 text-white/80 font-sans">{block.text}</p>
            </div>
          )
        }

        if (block.type === 'subclause') {
          return (
            <div key={`subclause-${idx}`} className="flex items-start gap-3 pl-6">
              <span className="w-7 shrink-0 text-[11px] font-mono text-white/50 mt-0.5">{block.index}</span>
              <p className="text-sm leading-7 text-white/70 font-sans">{block.text}</p>
            </div>
          )
        }

        if (block.type === 'bullet') {
          return (
            <div key={`bullet-${idx}`} className="flex items-start gap-3 pl-6">
              <span className="w-4 shrink-0 text-accent mt-0.5">•</span>
              <p className="text-sm leading-7 text-white/75 font-sans">{block.text}</p>
            </div>
          )
        }

        if (block.type === 'signature') {
          return (
            <p key={`signature-${idx}`} className="text-xs text-white/50 font-mono tracking-wide">
              {block.text}
            </p>
          )
        }

        return (
          <p key={`paragraph-${idx}`} className="text-sm leading-7 text-white/75 font-sans">
            {block.text}
          </p>
        )
      })}
    </div>
  )
}
