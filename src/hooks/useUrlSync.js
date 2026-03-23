import { useEffect, useRef } from 'react'
import useStore from '../store/useStore'

const TABS = ['home', 'tech', 'body', 'dept', 'year', 'patent']

/**
 * Syncs activeTab, filters, and globalSearch to/from URL search params.
 * Call once inside DashboardLayout.
 */
export function useUrlSync() {
  const {
    activeTab, setActiveTab,
    filters, setFilter,
    globalSearch, setGlobalSearch,
  } = useStore()

  const didInit = useRef(false)

  // ── On mount: read URL → store ──────────────────────────
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true

    const p = new URLSearchParams(window.location.search)

    const tab = p.get('tab')
    if (tab && TABS.includes(tab)) setActiveTab(tab)

    const tech = p.get('tech')
    if (tech) setFilter('techArea', tech.split(',').filter(Boolean))

    const body = p.get('body')
    if (body) setFilter('stdBody', body.split(',').filter(Boolean))

    const inst = p.get('inst')
    if (inst) setFilter('institute', inst)

    const status = p.get('status')
    if (status) setFilter('status', status.split(',').filter(Boolean))

    const recent = p.get('recent')
    if (recent === '1') setFilter('showRecentChanges', true)

    const q = p.get('q')
    if (q) setGlobalSearch(q)
  }, [])

  // ── On store change: store → URL ────────────────────────
  useEffect(() => {
    if (!didInit.current) return
    const p = new URLSearchParams()

    if (activeTab !== 'home')               p.set('tab', activeTab)
    if (filters.techArea.length)            p.set('tech', filters.techArea.join(','))
    if (filters.stdBody.length)             p.set('body', filters.stdBody.join(','))
    if (filters.institute)                  p.set('inst', filters.institute)
    if (filters.status.length)              p.set('status', filters.status.join(','))
    if (filters.showRecentChanges)          p.set('recent', '1')
    if (globalSearch.trim())                p.set('q', globalSearch.trim())

    const qs = p.toString()
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname
    window.history.replaceState(null, '', newUrl)
  }, [activeTab, filters, globalSearch])
}
