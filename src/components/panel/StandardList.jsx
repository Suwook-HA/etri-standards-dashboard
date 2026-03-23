import { useState, useMemo } from 'react'
import useStore from '../../store/useStore'
import { STATUS_COLORS } from '../../utils/constants'

const PAGE_SIZE = 20

export default function StandardList({ records, context }) {
  const { openDetailPanel, filters } = useStore()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('title')
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)

  // Apply local search + sort
  const processed = useMemo(() => {
    let rows = records
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.stdNo.toLowerCase().includes(q) ||
        r.contributor.toLowerCase().includes(q)
      )
    }
    rows = [...rows].sort((a, b) => {
      const av = String(a[sortKey] ?? ''), bv = String(b[sortKey] ?? '')
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return rows
  }, [records, search, sortKey, sortAsc])

  const totalPages = Math.ceil(processed.length / PAGE_SIZE)
  const paged = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleSort(key) {
    if (sortKey === key) setSortAsc(v => !v)
    else { setSortKey(key); setSortAsc(true) }
    setPage(1)
  }

  function SortTh({ colKey, label }) {
    const active = sortKey === colKey
    return (
      <th
        onClick={() => toggleSort(colKey)}
        className="px-3 py-2 text-left text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-700 select-none whitespace-nowrap"
      >
        {label}
        {active && <span className="ml-1 text-[10px]">{sortAsc ? '▲' : '▼'}</span>}
      </th>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Context + count */}
      <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 shrink-0">
        <p className="text-xs text-gray-600 font-medium">{context}</p>
        <p className="text-xs text-gray-400">{processed.length.toLocaleString()}건</p>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-gray-100 shrink-0">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="표준 제목, 번호, 기고자 검색..."
          className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
            <tr>
              <SortTh colKey="title" label="표준 제목" />
              <SortTh colKey="stdNo" label="번호" />
              <SortTh colKey="status" label="상태" />
              <SortTh colKey="endYear" label="완료" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paged.map((rec, i) => (
              <tr
                key={rec._recordKey + i}
                onClick={() => openDetailPanel(rec)}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-3 py-2 max-w-[200px]">
                  <div className="truncate text-gray-800 font-medium" title={rec.title}>{rec.title}</div>
                  {rec._changeType === 'new' && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded">신규</span>
                  )}
                  {rec._changeType === 'modified' && (
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1 rounded">수정</span>
                  )}
                </td>
                <td className="px-3 py-2 text-gray-500 whitespace-nowrap font-mono">{rec.stdNo}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[rec.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {rec.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{rec.endYear ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 shrink-0">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs text-gray-500 disabled:opacity-30 hover:text-gray-700"
          >
            ← 이전
          </button>
          <span className="text-xs text-gray-400">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-xs text-gray-500 disabled:opacity-30 hover:text-gray-700"
          >
            다음 →
          </button>
        </div>
      )}
    </div>
  )
}
