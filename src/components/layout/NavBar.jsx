import useStore from '../../store/useStore'

const TABS = [
  { key: 'home',   label: '홈' },
  { key: 'tech',   label: '전략기술' },
  { key: 'body',   label: '표준기구' },
  { key: 'dept',   label: '부서' },
  { key: 'year',   label: '연도별' },
  { key: 'patent', label: '표준특허' },
]

export default function NavBar() {
  const { activeTab, setActiveTab } = useStore()

  return (
    <nav className="bg-white border-b border-gray-200 px-5 shrink-0">
      <div className="flex gap-0">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === t.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
