import useStore from '../../store/useStore'
import { TECH_AREAS, VALID_STATUSES, INSTITUTES } from '../../utils/constants'
import { exportToExcel } from '../../utils/exportExcel'

export default function FilterBar() {
  const { filters, setFilter, resetFilters, records, getFilteredRecords, activeTab } = useStore()

  // Derive available stdBodies from records
  const stdBodies = [...new Set(records.map(r => r.stdBody).filter(Boolean))].sort()

  const activeCount = [
    filters.techArea.length,
    filters.stdBody.length,
    filters.institute ? 1 : 0,
    filters.status.length,
    filters.fundingAgency.length,
    filters.showRecentChanges ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  function toggleMulti(key, value) {
    const cur = filters[key]
    const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value]
    setFilter(key, next)
  }

  return (
    <div className="bg-white border-b border-gray-100 px-5 py-2 flex items-center gap-3 flex-wrap shrink-0">
      {/* 전략기술 */}
      <MultiSelect
        label="전략기술"
        options={TECH_AREAS}
        selected={filters.techArea}
        onToggle={v => toggleMulti('techArea', v)}
        labelFn={v => v.replace(/^\d+\) /, '')}
      />

      {/* 표준기구 */}
      <MultiSelect
        label="표준기구"
        options={stdBodies}
        selected={filters.stdBody}
        onToggle={v => toggleMulti('stdBody', v)}
      />

      {/* 부서 */}
      <select
        value={filters.institute}
        onChange={e => setFilter('institute', e.target.value)}
        className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">부서 전체</option>
        {INSTITUTES.map(inst => <option key={inst} value={inst}>{inst}</option>)}
      </select>

      {/* 표준화 상태 */}
      <MultiSelect
        label="상태"
        options={VALID_STATUSES}
        selected={filters.status}
        onToggle={v => toggleMulti('status', v)}
      />

      {/* 이번 갱신 토글 */}
      <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.showRecentChanges}
          onChange={e => setFilter('showRecentChanges', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 w-3.5 h-3.5"
        />
        이번 갱신
      </label>

      {/* Right side: filter badge + reset + export */}
      <div className="flex items-center gap-2 ml-auto">
        {activeCount > 0 && (
          <>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              필터 {activeCount}개 적용
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              초기화
            </button>
          </>
        )}
        <button
          onClick={() => {
            const filtered = getFilteredRecords()
            const ctx = activeCount > 0 ? `필터적용_${filtered.length}건` : `전체_${filtered.length}건`
            exportToExcel(filtered, ctx)
          }}
          className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 flex items-center gap-1.5"
          title="현재 필터된 목록을 Excel로 내보내기"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Excel 내보내기
        </button>
      </div>
    </div>
  )
}

function MultiSelect({ label, options, selected, onToggle, labelFn }) {
  const display = labelFn ?? (v => v)
  return (
    <div className="relative group">
      <button className={`text-xs border rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 transition-colors
        ${selected.length > 0 ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
        {label}
        {selected.length > 0 && (
          <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
            {selected.length}
          </span>
        )}
        <span className="text-[10px]">▾</span>
      </button>
      {/* Dropdown */}
      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 min-w-[180px] max-h-64 overflow-y-auto hidden group-focus-within:block group-hover:block">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs text-gray-700">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => onToggle(opt)}
              className="rounded border-gray-300 text-blue-600 w-3.5 h-3.5"
            />
            {display(opt)}
          </label>
        ))}
      </div>
    </div>
  )
}
