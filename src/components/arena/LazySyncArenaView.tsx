import { lazy, Suspense } from 'react'
import { TabLoadingShell } from '../app/TabLoadingShell'
import { isStaleChunkError, reloadForNewBuild } from '../../utils/chunkReload'
import type { SyncArenaViewProps } from './SyncArenaView'

const SyncArenaViewLazy = lazy(async () => {
  try {
    const mod = await import('./SyncArenaView')
    return { default: mod.SyncArenaView }
  } catch (err) {
    if (isStaleChunkError(err)) reloadForNewBuild()
    throw err
  }
})

function ArenaLoadingShell() {
  return (
    <div
      className="em-visual-v2 em-v2-arena arena-fullscreen arena-sala-sync flex items-center justify-center min-h-[100dvh]"
      role="status"
      aria-live="polite"
      aria-label="Abriendo Sala Sync"
    >
      <TabLoadingShell message="Abriendo Sala Sync…" />
    </div>
  )
}

/** Lazy-loaded SyncArenaView — fase 206 entreno polish. */
export function LazySyncArenaView(props: SyncArenaViewProps) {
  return (
    <Suspense fallback={<ArenaLoadingShell />}>
      <SyncArenaViewLazy {...props} />
    </Suspense>
  )
}