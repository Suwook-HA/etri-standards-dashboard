import { useState, useMemo } from 'react'
import useStore from '../../store/useStore'
import { STATUS_CHART_COLORS } from '../../utils/constants'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts'

const STATUS_ORDER = ['제정완료', '개발중', '제안중', '계획중', '개발중단']

export default function StdBodyView() {
  const { getFilteredRecords, openListPanel } = useStore()
  const records = getFilteredRecords()
  const [drillBody, setDrillBody] = useState(null) // null = top level

  const bodyData = useMemo(() => {
    const map = {}
    records.forEach(r => {
      if (!r.stdBody) return
      if (!map[r.stdBody]) map[r.stdBody] = { name: r.stdBody, total: 0 }
      map[r.stdBody].total++
      map[r.stdBody][r.status] = (map[r.stdBody][r.status] ?? 0) + 1
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [records])

  const wgData = useMemo(() => {
    if (!drillBody) return []
    const filtered = records.filter(r => r.stdBody === drillBody)
    const map = {}
    filtered.forEach(r => {
      const wg = r.workingGroup || '(미지정)'
      if (!map[wg]) map[wg] = { name: wg, total: 0 }
      map[wg].total++
      map[wg][r.status] = (map[wg][r.status] ?? 0) + 1
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [records, drillBody])

  const drillRecords = drillBody ? records.filter(r => r.stdBody === drillBody) : []

  // Pie for selected body status breakdown
  const drillPie = useMemo(() => {
    if (!drillBody) return []
    const counts = {}
    drillRecords.forEach(r => { counts[r.status] = (counts[r.status] ?? 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [drillRecords, drillBody])

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => setDrillBody(null)}
          className={`font-medium ${!drillBody ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          전체 표준기구
        </button>
        {drillBody && (
          <>
            <span className="text-gray-300">/</span>
            <span className="font-medium text-blue-600">{drillBody}</span>
            <span className="text-xs text-gray-400">({drillRecords.length}건)</span>
          </>
        )}
      </div>

      {!drillBody ? (
        <>
          {/* Top-level bar chart */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-1">표준기구별 현황</h3>
            <p className="text-[10px] text-gray-400 mb-3">막대 클릭 시 해당 기구의 작업반별 현황으로 드릴다운</p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={bodyData} layout="vertical" margin={{ left: 8, right: 50 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, n) => [`${v}건`, n]} />
                <Legend iconSize={9} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                {STATUS_ORDER.map(s => (
                  <Bar key={s} dataKey={s} stackId="a" fill={STATUS_CHART_COLORS[s] ?? '#9ca3af'}
                    cursor="pointer"
                    onClick={d => setDrillBody(d.name)}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary table */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">표준기구별 상세 현황</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-3 text-gray-500 font-medium">표준기구</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">합계</th>
                  {STATUS_ORDER.map(s => (
                    <th key={s} className="text-right py-2 px-2 text-gray-500 font-medium">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bodyData.map(d => (
                  <tr key={d.name} className="hover:bg-blue-50 cursor-pointer"
                    onClick={() => setDrillBody(d.name)}>
                    <td className="py-2 pr-3 text-blue-600 font-medium hover:underline">{d.name}</td>
                    <td className="py-2 px-2 text-right font-semibold text-gray-800">{d.total}</td>
                    {STATUS_ORDER.map(s => (
                      <td key={s} className="py-2 px-2 text-right text-gray-600">{d[s] ?? 0}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* Drilled into a body */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Status pie */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">{drillBody} 상태 현황</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={drillPie} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                    paddingAngle={2} dataKey="value"
                    onClick={d => openListPanel(`${drillBody} > ${d.name}`, drillRecords.filter(r => r.status === d.name))}
                    cursor="pointer">
                    {drillPie.map(e => (
                      <Cell key={e.name} fill={STATUS_CHART_COLORS[e.name] ?? '#9ca3af'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v}건`, n]} />
                  <Legend iconSize={9} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* WG bar chart */}
            <div className="bg-white rounded-xl shadow-sm p-4 xl:col-span-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">작업반(WG/SG)별 현황</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={wgData.slice(0, 15)} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v, n) => [`${v}건`, n]} />
                  {STATUS_ORDER.map(s => (
                    <Bar key={s} dataKey={s} stackId="a" fill={STATUS_CHART_COLORS[s] ?? '#9ca3af'}
                      cursor="pointer"
                      onClick={d => openListPanel(
                        `${drillBody} > ${d.name} > ${s}`,
                        drillRecords.filter(r => r.workingGroup === d.name && r.status === s)
                      )}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* WG detail table */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">작업반별 상세 현황</h3>
              <button
                onClick={() => openListPanel(`표준기구: ${drillBody}`, drillRecords)}
                className="text-xs text-blue-600 hover:underline"
              >
                전체 목록 보기 →
              </button>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-3 text-gray-500 font-medium">작업반</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">합계</th>
                  {STATUS_ORDER.map(s => (
                    <th key={s} className="text-right py-2 px-2 text-gray-500 font-medium">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {wgData.map(d => (
                  <tr key={d.name} className="hover:bg-blue-50 cursor-pointer"
                    onClick={() => openListPanel(`${drillBody} > ${d.name}`, drillRecords.filter(r => r.workingGroup === d.name))}>
                    <td className="py-2 pr-3 text-gray-700 font-medium">{d.name}</td>
                    <td className="py-2 px-2 text-right font-semibold text-gray-800">{d.total}</td>
                    {STATUS_ORDER.map(s => (
                      <td key={s} className="py-2 px-2 text-right text-gray-600">{d[s] ?? 0}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
