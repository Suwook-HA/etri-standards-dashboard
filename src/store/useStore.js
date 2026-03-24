import { create } from 'zustand'
import { useDataStore } from './dataStore'
import { useFilterStore } from './filterStore'
import { usePanelStore } from './panelStore'

const useStore = create((set, get) => ({
  // ── App state ──────────────────────────────────────────
  appState: 'loading',
  setAppState: (appState) => {
    set({ appState })
    useDataStore.setState({ appState })
  },

  // ── Active data ────────────────────────────────────────
  records: [],
  setRecords: (records) => {
    set({ records })
    useDataStore.setState({ records })
  },
  dataDate: null,
  setDataDate: (dataDate) => set({ dataDate }),
  activeVersion: null,
  setActiveVersion: (activeVersion) => {
    set({ activeVersion })
    useDataStore.setState({ activeVersion })
  },

  // ── Upload flow state ──────────────────────────────────
  pendingRecords: null,
  setPendingRecords: (pendingRecords) => set({ pendingRecords }),
  pendingHeaders: [],
  setPendingHeaders: (pendingHeaders) => set({ pendingHeaders }),
  validationResult: null,
  setValidationResult: (validationResult) => set({ validationResult }),
  diffResult: null,
  setDiffResult: (diffResult) => set({ diffResult }),
  uploadMemo: '',
  setUploadMemo: (uploadMemo) => set({ uploadMemo }),
  uploadFileName: '',
  setUploadFileName: (uploadFileName) => set({ uploadFileName }),

  // ── Filters: delegate writes to filterStore ────────────
  filters: {
    techArea: [], stdBody: [], institute: '', status: [],
    endYearRange: [2002, 2030], fundingAgency: [],
    showRecentChanges: false,
  },
  globalSearch: '',
  setFilter: (key, value) => useFilterStore.getState().setFilter(key, value),
  resetFilters: () => useFilterStore.getState().resetFilters(),
  setGlobalSearch: (q) => useFilterStore.getState().setGlobalSearch(q),

  // ── Side panel: delegate to panelStore ─────────────────
  sidePanel: null,
  panelHistory: [],
  openListPanel: (context, records) => {
    const ctx = typeof context === 'string' ? { label: context } : context
    usePanelStore.getState().openList(ctx, records ?? [])
  },
  openDetailPanel: (record) => usePanelStore.getState().openDetail(record),
  goBackPanel: () => usePanelStore.getState().goBack(),
  closePanel: () => usePanelStore.getState().close(),

  // ── Active nav tab ─────────────────────────────────────
  activeTab: 'home',
  setActiveTab: (activeTab) => set({ activeTab }),
  showVersionHistory: false,
  setShowVersionHistory: (v) => set({ showVersionHistory: v }),

  // ── Derived: filtered records ──────────────────────────
  getFilteredRecords: () => {
    const { records } = get()
    const { filters, globalSearch } = useFilterStore.getState()
    const q = globalSearch.trim().toLowerCase()
    return records.filter(r => {
      if (q) {
        const hit =
          r.title?.toLowerCase().includes(q) ||
          r.stdNo?.toLowerCase().includes(q) ||
          r.contributor?.toLowerCase().includes(q) ||
          r.stdBody?.toLowerCase().includes(q) ||
          r.workingGroup?.toLowerCase().includes(q)
        if (!hit) return false
      }
      if (filters.techArea.length > 0 && !filters.techArea.includes(r.techArea)) return false
      if (filters.stdBody.length > 0 && !filters.stdBody.includes(r.stdBody)) return false
      if (filters.institute && r.institute !== filters.institute) return false
      if (filters.status.length > 0 && !filters.status.includes(r.status)) return false
      if (filters.fundingAgency.length > 0 && !filters.fundingAgency.includes(r.fundingAgency)) return false
      if (filters.showRecentChanges && !['new', 'modified'].includes(r._changeType)) return false
      const [minY, maxY] = filters.endYearRange
      if (r.endYear && (r.endYear < minY || r.endYear > maxY)) return false
      return true
    })
  },
}))

// ── Sync filterStore → useStore (reactivity for existing components) ──
useFilterStore.subscribe((state) => {
  useStore.setState({ filters: state.filters, globalSearch: state.globalSearch })
})

// ── Sync panelStore → useStore (for components that read sidePanel) ──
usePanelStore.subscribe((state) => {
  useStore.setState({ sidePanel: state.panel, panelHistory: state.history })
})

export default useStore
