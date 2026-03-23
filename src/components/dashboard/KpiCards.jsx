import useStore from '../../store/useStore'

const KPI_DEFS = [
  {
    key: 'total',
    label: '총 표준 수',
    color: 'border-t-blue-500',
    iconBg: 'bg-blue-50',
    icon: '📋',
    filter: () => true,
    context: '전체 표준 목록',
  },
  {
    key: '제정완료',
    label: '제정완료',
    color: 'border-t-blue-400',
    iconBg: 'bg-blue-50',
    icon: '✓',
    filter: r => r.status === '제정완료',
    context: '제정완료 표준 목록',
  },
  {
    key: '개발중',
    label: '개발중',
    color: 'border-t-green-500',
    iconBg: 'bg-green-50',
    icon: '⚙',
    filter: r => r.status === '개발중',
    context: '개발중 표준 목록',
  },
  {
    key: '제안중',
    label: '제안중',
    color: 'border-t-yellow-500',
    iconBg: 'bg-yellow-50',
    icon: '💡',
    filter: r => r.status === '제안중',
    context: '제안중 표준 목록',
  },
  {
    key: '계획중',
    label: '계획중',
    color: 'border-t-purple-500',
    iconBg: 'bg-purple-50',
    icon: '📅',
    filter: r => r.status === '계획중',
    context: '계획중 표준 목록',
  },
  {
    key: 'patent',
    label: '표준특허 보유',
    color: 'border-t-orange-500',
    iconBg: 'bg-orange-50',
    icon: '🏷',
    filter: r => r.hasPatent === '유',
    context: '표준특허 보유 목록',
  },
]

export default function KpiCards() {
  const { getFilteredRecords, openListPanel } = useStore()
  const filtered = getFilteredRecords()

  function handleClick(def) {
    const recs = def.key === 'total' ? filtered : filtered.filter(def.filter)
    openListPanel(def.context, recs)
  }

  return (
    <div className="grid grid-cols-3 xl:grid-cols-6 gap-3">
      {KPI_DEFS.map(def => {
        const count = def.key === 'total'
          ? filtered.length
          : filtered.filter(def.filter).length
        return (
          <button
            key={def.key}
            onClick={() => handleClick(def)}
            className={`bg-white rounded-xl border-t-4 ${def.color} shadow-sm p-4 text-left
              hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer`}
          >
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${def.iconBg} text-base mb-2`}>
              {def.icon}
            </div>
            <div className="text-2xl font-bold text-gray-800">{count.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-0.5">{def.label}</div>
          </button>
        )
      })}
    </div>
  )
}
