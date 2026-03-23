import { useMemo } from 'react'
import useStore from '../../store/useStore'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts'

const COLORS = ['#3b82f6', '#e5e7eb', '#f59e0b', '#10b981', '#ef4444']

export default function PatentView() {
  const { getFilteredRecords, openListPanel } = useStore()
  const records = getFilteredRecords()

  const patentRecords = records.filter(r => r.hasPatent === '유')
  const noPatentRecords = records.filter(r => r.hasPatent === '무')

  const hasPatentPie = [
    { name: '표준특허 보유', value: patentRecords.length },
    { name: '표준특허 없음', value: noPatentRecords.length },
  ]

  const statusData = useMemo(() => {
    const map = {}
    patentRecords.forEach(r => {
      const key = r.patentStatus || '미지정'
      map[key] = (map[key] ?? 0) + 1
    })
    const sorted = Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    // Collapse long tail into '기타'
    if (sorted.length > 6) {
      const top = sorted.slice(0, 5)
      const rest = sorted.slice(5).reduce((s, d) => s + d.value, 0)
      return [...top, { name: '기타', value: rest }]
    }
    return sorted
  }, [patentRecords])

  const countData = useMemo(() => {
    const map = {}
    patentRecords.forEach(r => {
      const cnt = r.patentCount ? String(r.patentCount) : '미지정'
      map[cnt] = (map[cnt] ?? 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => {
      const an = parseInt(a.name), bn = parseInt(b.name)
      if (!isNaN(an) && !isNaN(bn)) return an - bn
      return 0
    })
  }, [patentRecords])

  const countryData = useMemo(() => {
    const map = {}
    patentRecords.forEach(r => {
      if (!r.patentCountry) return
      r.patentCountry.split(/[,/]/).forEach(c => {
        const t = c.trim()
        if (t) map[t] = (map[t] ?? 0) + 1
      })
    })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10)
  }, [patentRecords])

  const techAreaData = useMemo(() => {
    const map = {}
    patentRecords.forEach(r => {
      if (!r.techArea) return
      const key = r.techArea.replace(/^\d+\) /, '')
      map[key] = (map[key] ?? 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [patentRecords])

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard label="표준특허 보유 표준" value={patentRecords.length} color="border-t-blue-500"
          onClick={() => openListPanel('표준특허 보유 목록', patentRecords)} />
        <KpiCard label="보유율" value={`${Math.round(patentRecords.length / records.length * 100)}%`} color="border-t-green-500" />
        <KpiCard label="총 특허 건수" value={patentRecords.reduce((s, r) => s + (parseInt(r.patentCount) || 0), 0)} color="border-t-amber-500" />
        <KpiCard label="관련 발명자 수" value={new Set(patentRecords.flatMap(r => r.inventor?.split(',').map(v => v.trim()) ?? [])).size} color="border-t-purple-500" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Has/no patent donut */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">표준특허 보유 현황</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={hasPatentPie} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                paddingAngle={3} dataKey="value"
                onClick={d => openListPanel(d.name, d.name === '표준특허 보유' ? patentRecords : noPatentRecords)}
                cursor="pointer">
                <Cell fill="#3b82f6" />
                <Cell fill="#e5e7eb" />
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}건`, n]} />
              <Legend iconSize={9} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Patent status pie */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">특허 상태별 분포</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                paddingAngle={2} dataKey="value"
                onClick={d => openListPanel(`특허상태: ${d.name}`, patentRecords.filter(r => (r.patentStatus || '미지정') === d.name))}
                cursor="pointer">
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}건`, n]} />
              <Legend iconSize={9} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Country bar */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">출원국가 분포 (상위 10)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={countryData} layout="vertical" margin={{ left: 4, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`${v}건`]} />
              <Bar dataKey="value" name="건수" fill="#60a5fa" cursor="pointer"
                onClick={d => openListPanel(`출원국: ${d.name}`, patentRecords.filter(r => r.patentCountry?.includes(d.name)))}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tech area + patent count distributions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">전략기술별 표준특허 분포</h3>
          <ResponsiveContainer width="100%" height={Math.max(200, techAreaData.length * 26)}>
            <BarChart data={techAreaData} layout="vertical" margin={{ left: 8, right: 30 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`${v}건`]} />
              <Bar dataKey="value" name="표준특허 보유" fill="#a78bfa" cursor="pointer"
                onClick={d => openListPanel(`전략기술: ${d.name} > 표준특허`, patentRecords.filter(r => r.techArea?.includes(d.name)))}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">표준당 특허 개수 분포</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={countData} margin={{ left: 0, right: 16 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} label={{ value: '특허 개수', position: 'insideBottom', offset: -5, fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v}건`]} />
              <Bar dataKey="value" name="표준 건수" fill="#34d399" cursor="pointer"
                onClick={d => openListPanel(`특허 ${d.name}개 보유`, patentRecords.filter(r => String(r.patentCount) === d.name))}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Patent detail table */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">표준특허 보유 목록</h3>
          <span className="text-xs text-gray-400">{patentRecords.length}건</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-3 text-gray-500 font-medium">표준 제목</th>
                <th className="text-left py-2 px-2 text-gray-500 font-medium">번호</th>
                <th className="text-left py-2 px-2 text-gray-500 font-medium">특허상태</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">특허수</th>
                <th className="text-left py-2 pl-2 text-gray-500 font-medium">출원국</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {patentRecords.slice(0, 50).map((r, i) => (
                <tr key={i} className="hover:bg-blue-50">
                  <td className="py-2 pr-3 text-gray-800 max-w-[240px]">
                    <div className="truncate" title={r.title}>{r.title}</div>
                  </td>
                  <td className="py-2 px-2 text-gray-500 whitespace-nowrap font-mono">{r.stdNo}</td>
                  <td className="py-2 px-2 text-gray-600">{r.patentStatus || '-'}</td>
                  <td className="py-2 px-2 text-right text-gray-800 font-medium">{r.patentCount ?? '-'}</td>
                  <td className="py-2 pl-2 text-gray-600">{r.patentCountry || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {patentRecords.length > 50 && (
            <div className="text-center pt-2">
              <button onClick={() => openListPanel('표준특허 보유 전체 목록', patentRecords)}
                className="text-xs text-blue-600 hover:underline">
                전체 {patentRecords.length}건 목록 보기 →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, color, onClick }) {
  return (
    <button onClick={onClick}
      className={`bg-white rounded-xl border-t-4 ${color} shadow-sm p-4 text-left w-full ${onClick ? 'hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer' : 'cursor-default'}`}>
      <div className="text-2xl font-bold text-gray-800">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </button>
  )
}
