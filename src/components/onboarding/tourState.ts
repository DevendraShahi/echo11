// Module-level state so any component can trigger a tour on the next page load.
let pendingTourPageId: string | null = null

export function setPendingTour(pageId: string) {
  pendingTourPageId = pageId
}

export function consumePendingTour(pageId: string): boolean {
  if (pendingTourPageId === pageId) {
    pendingTourPageId = null
    return true
  }
  return false
}
