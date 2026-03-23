import { create } from 'zustand'

const useStore = create((set, get) => ({
  // ── App state ──────────────────────────────────────────
  /** 'loading' | 'upload' | 'validating' | 'diffing' | 'dashboard' */
  appState: 'loading',
  setAppState: (appState) => set({ appState }),

  // ── Active data ────────────────────────────────────────
  /** Full records array (active version) */
  records: [],
  setRecords: (records) => set({ records }),

  /** Current data reference date string e.g. "2025-07" */
  dataDate: null,
  setDataDate: (dataDate) => set({ dataDate }),

  /** Active version number */
  activeVersion: null,
  setActiveVersion: (activeVersion) => set({ activeVersion }),

  // ── Upload flow state ──────────────────────────────────
  /** Parsed records from the new file being uploaded */
  pendingRecords: null,
  setPendingRecords: (pendingRecords) => set({ pendingRecords }),

  /** Raw headers from new file */
  pendingHeaders: [],
  setPendingHeaders: (pendingHeaders) => set({ pendingHeaders }),

  /** Validation result: { errors, warnings, passed } */
  validationResult: null,
  setValidationResult: (validationResult) => set({ validationResult }),

  /** Diff result: { new[], modified[], removed[], unchanged[] } */
  diffResult: null,
  setDiffResult: (diffResult) => set({ diffResult }),

  /** Upload memo text */
  uploadMemo: '',
  setUploadMemo: (uploadMemo) => set({ uploadMemo }),

  /** Filename being uploaded */
  uploadFileName: '',
  setUploadFileName: (uploadFileName) => set({ uploadFileName }),

  // ── Global filters ─────────────────────────────────────
  filters: {
    techArea: [],        // string[]
    stdBody: [],         // string[]
    institute: '',       // single string
    status: [],          // string[]
    endYearRange: [2002, 2030],
    fundingAgency: [],
    showRecentChanges: false,
  },
  setFilter: (key, value) =>
    set(state => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () =>
    set({
      filters: {
        techArea: [], stdBody: [], institute: '', status: [],
        endYearRange: [2002, 2030], fundingAgency: [],
        showRecentChanges: false,
      },
    }),

  // ── Side panel ─────────────────────────────────────────
  /** null | { type: 'list', context, records } | { type: 'detail', record } */
  sidePanel: null,
  panelHistory: [],

  openListPanel: (context, records) =>
    set(state => ({
      panelHistory: state.sidePanel ? [...state.panelHistory, state.sidePanel] : [],
      sidePanel: { type: 'list', context, records },
    })),

  openDetailPanel: (record) =>
    set(state => ({
      panelHistory: state.sidePanel ? [...state.panelHistory, state.sidePanel] : [],
      sidePanel: { type: 'detail', record },
    })),

  goBackPanel: () =>
    set(state => {
      if (state.panelHistory.length === 0) return { sidePanel: null, panelHistory: [] }
      const history = [...state.panelHistory]
      const prev = history.pop()
      return { sidePanel: prev, panelHistory: history }
    }),

  closePanel: () => set({ sidePanel: null, panelHistory: [] }),

  // ── Active nav tab ─────────────────────────────────────
  /** 'home' | 'tech' | 'body' | 'dept' | 'year' | 'patent' */
  activeTab: 'home',
  setActiveTab: (activeTab) => set({ activeTab }),

  // ── Global search ──────────────────────────────────────
  globalSearch: '',
  setGlobalSearch: (globalSearch) => set({ globalSearch }),

  // ── Version history modal ──────────────────────────────
  showVersionHistory: false,
  setShowVersionHistory: (v) => set({ showVersionHistory: v }),

  // ── Derived: filtered records ──────────────────────────
  getFilteredRecords: () => {
    const { records, filters, globalSearch } = get()
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

export default useStore
