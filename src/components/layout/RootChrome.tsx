'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const SplashScreen = dynamic(
  () => import('@/components/layout/SplashScreen').then((mod) => mod.SplashScreen),
  { ssr: false }
)
const Cursor = dynamic(
  () => import('@/components/ui/Cursor').then((mod) => mod.Cursor),
  { ssr: false }
)
const Navbar = dynamic(
  () => import('@/components/layout/Navbar').then((mod) => mod.Navbar),
  { ssr: false }
)

function isAppShellPath(pathname: string): boolean {
  return pathname.startsWith('/lab') || pathname.startsWith('/portal') || pathname.startsWith('/client')
}

export function RootChrome() {
  const pathname = usePathname()

  if (!pathname || isAppShellPath(pathname)) {
    return null
  }

  return (
    <>
      <SplashScreen />
      <Cursor />
      <Navbar />
    </>
  )
}

