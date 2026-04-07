'use client'

import { Heart, Github } from 'lucide-react'
import Link from 'next/link'

export function LabFooter() {
  return (
    <footer className="h-14 bg-black/30 backdrop-blur-md border-t border-white/5 flex items-center justify-between px-6 font-sans sticky bottom-0 z-50">
      <div className="flex items-center gap-2 text-xs text-white/30">
        <span>Built with</span>
        <Heart className="w-3 h-3 text-rose-500" />
        <span>by echo11</span>
      </div>
      
      <div className="flex items-center gap-4">
        <Link 
          href="https://github.com" 
          target="_blank"
          className="text-white/30 hover:text-white transition-colors"
        >
          <Github className="w-4 h-4" />
        </Link>
        <span className="text-xs text-white/20">
          v1.0.0
        </span>
      </div>
    </footer>
  )
}
