/**
 * Client-side splash lifecycle coordination.
 *
 * SplashScreen marks the session "resolved" (either it has finished its
 * curtain exit, or it decided not to show at all). Sections that animate in
 * behind the splash — currently the Hero — subscribe so their reveal starts
 * exactly as the curtain begins lifting instead of playing unseen underneath
 * it.
 *
 * Module-level state is intentional: it survives client-side navigations
 * within the session, so remounting Hero on a later visit reveals instantly.
 */
let done = false;
const listeners = new Set<() => void>();

export function isSplashDone(): boolean {
  return done;
}

export function markSplashDone(): void {
  if (done) {
    return;
  }
  done = true;
  listeners.forEach((listener) => listener());
  listeners.clear();
}

/** Subscribe to splash resolution. Fires immediately if it already resolved. */
export function onSplashDone(listener: () => void): () => void {
  if (done) {
    listener();
    return () => {};
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
