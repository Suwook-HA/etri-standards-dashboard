import KpiCards from './KpiCards'
import useStore from '../../store/useStore'
import { STATUS_CHART_COLORS } from '../../utils/constants'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line, CartesianGrid,
} from 'recharts'

export default function HomeView() {
  const { getFilteredRecords, openListPanel, diffResult, activeVersion } = useStore()
  const records = getFilteredRecords()

  // ── Status pie data ──
  const statusCounts = {}
  records.forEach(r => { statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1 })
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

  // ── Tech area bar data ──
  const techCounts = {}
  records.forEach(r => {
    if (!r.techArea) return
    if (!techCounts[r.techArea]) techCounts[r.techArea] = {}
    techCounts[r.techArea][r.status] = (techCounts[r.techArea][r.status] ?? 0) + 1
  })
  const barData = Object.entries(techCounts)
    .map(([tech, counts]) => ({
      name: tech.replace(/^\d+\) /, ''),
      fullName: tech,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
      ...counts,
    }))
    .sort((a, b) => b.total - a.total)

  // ── Recent changes ──
  const newCount = diffResult?.new?.length ?? records.filter(r => r.changeTypeRaw === 'N').length
  const modCount = diffResult?.modified?.length ?? records.filter(r => r.changeTypeRaw === 'R').length

  // ── Top standards bodies ──
  const bodyCountsMap = {}
  records.forEach(r => { if (r.stdBody) bodyCountsMap[r.stdBody] = (bodyCountsMap[r.stdBody] ?? 0) + 1 })
  const bodyData = Object.entries(bodyCountsMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  // ── Year completion trend ──
  const yearMap = {}
  records.filter(r => r.endYear && r.status === '제정완료')
    .forEach(r => { yearMap[r.endYear] = (yearMap[r.endYear] ?? 0) + 1 })
  const yearData = Object.entries(yearMap)
    .sort((a, b) => a[0] - b[0])
    .map(([year, count]) => ({ year, count }))

  // ── Top contributors ──
  const contribMap = {}
  records.forEach(r => {
    if (!r.contributor) return
    r.contributor.split(',').forEach(c => {
      const t = c.trim()
      if (t) contribMap[t] = (contribMap[t] ?? 0) + 1
    })
  })
  const contribData = Object.entries(contribMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <KpiCards />

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Status pie */}
        <ChartCard title="표준화 상태 현황">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                onClick={d => openListPanel(`상태: ${d.name}`, records.filter(r => r.status === d.name))}
                cursor="pointer"
              >
                {pieData.map(entry => (
                  <Cell key={entry.name} fill={STATUS_CHART_COLORS[entry.name] ?? '#9ca3af'} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}건`, n]} />
              <Legend iconSize={10} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Tech bar — spans 2 cols */}
        <ChartCard title="12대 전략기술별 현황" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={72}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                formatter={(v, n) => [`${v}건`, n]}
                labelFormatter={l => barData.find(d => d.name === l)?.fullName ?? l}
              />
              {['제정완료', '개발중', '제안중', '계획중', '개발중단'].map(s => (
                <Bar
                  key={s}
                  dataKey={s}
                  stackId="a"
                  fill={STATUS_CHART_COLORS[s]}
                  cursor="pointer"
                  onClick={d => openListPanel(
                    `${d.fullName ?? d.name} > ${s}`,
                    records.filter(r => r.techArea === d.fullName && r.status === s)
                  )}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Second charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Top standards bodies */}
        <ChartCard title="표준기구별 현황 (상위 8)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bodyData} layout="vertical" margin={{ left: 8, right: 30 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`${v}건`]} />
              <Bar dataKey="value" name="표준 수" fill="#60a5fa" cursor="pointer"
                onClick={d => openListPanel(`표준기구: ${d.name}`, records.filter(r => r.stdBody === d.name))} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Year completion trend */}
        <ChartCard title="연도별 제정완료 추이">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={yearData} margin={{ left: 0, right: 16, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`${v}건`]} />
              <Line type="monotone" dataKey="count" name="제정완료" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }}
                activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top contributors */}
        <ChartCard title="기고자별 현황 (상위 8)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={contribData} layout="vertical" margin={{ left: 8, right: 30 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`${v}건`]} />
              <Bar dataKey="value" name="표준 수" fill="#a78bfa" cursor="pointer"
                onClick={d => openListPanel(`기고자: ${d.name}`, records.filter(r => r.contributor?.includes(d.name)))} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent changes widget */}
      {activeVersion && (
        <ChartCard title="최근 갱신 현황">
          <div className="flex items-stretch gap-3">
            <ChangeCard
              label="신규 추가"
              count={newCount}
              color="text-green-600"
              bg="bg-green-50"
              prefix="+"
              onClick={() => {
                const recs = records.filter(r => r._changeType === 'new' || r.changeTypeRaw === 'N')
                openListPanel('신규 추가 표준 목록', recs)
              }}
            />
            <ChangeCard
              label="내용 수정"
              count={modCount}
              color="text-yellow-600"
              bg="bg-yellow-50"
              onClick={() => {
                const recs = records.filter(r => r._changeType === 'modified' || r.changeTypeRaw === 'R')
                openListPanel('수정된 표준 목록', recs)
              }}
            />
          </div>
        </ChartCard>
      )}
    </div>
  )
}

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      {children}
    </div>
  )
}

function ChangeCard({ label, count, color, bg, prefix = '', onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 ${bg} rounded-lg p-4 text-left hover:opacity-80 transition-opacity`}
    >
      <div className={`text-2xl font-bold ${color}`}>{prefix}{count.toLocaleString()}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
      <div className="text-xs text-gray-400 mt-2 underline">목록 보기 →</div>
    </button>
  )
}
