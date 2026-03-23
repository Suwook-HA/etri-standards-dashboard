import { useState, useMemo } from 'react'
import useStore from '../../store/useStore'
import { STATUS_CHART_COLORS } from '../../utils/constants'
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
  BarChart, Bar, Legend,
} from 'recharts'

const STATUS_ORDER = ['제정완료', '개발중', '제안중', '계획중', '개발중단']

export default function TechAreaView() {
  const { getFilteredRecords, openListPanel } = useStore()
  const records = getFilteredRecords()
  const [sortKey, setSortKey] = useState('total')

  const techData = useMemo(() => {
    const map = {}
    records.forEach(r => {
      if (!r.techArea) return
      if (!map[r.techArea]) map[r.techArea] = { name: r.techArea, total: 0 }
      map[r.techArea].total++
      map[r.techArea][r.status] = (map[r.techArea][r.status] ?? 0) + 1
    })
    return Object.values(map).map(d => ({
      ...d,
      shortName: d.name.replace(/^\d+\) /, ''),
      completionRate: Math.round(((d['제정완료'] ?? 0) / d.total) * 100),
    }))
  }, [records])

  const sorted = useMemo(() =>
    [...techData].sort((a, b) =>
      sortKey === 'total' ? b.total - a.total :
      sortKey === 'completion' ? b.completionRate - a.completionRate :
      a.shortName.localeCompare(b.shortName)
    ), [techData, sortKey])

  // Quadrant medians
  const medX = useMemo(() => {
    const xs = techData.map(d => d.total).sort((a, b) => a - b)
    return xs[Math.floor(xs.length / 2)] ?? 50
  }, [techData])
  const medY = useMemo(() => {
    const ys = techData.map(d => d.completionRate).sort((a, b) => a - b)
    return ys[Math.floor(ys.length / 2)] ?? 50
  }, [techData])

  const quadrantColor = (d) => {
    if (d.total >= medX && d.completionRate >= medY) return '#3b82f6'   // 우상 - 강점
    if (d.total < medX && d.completionRate >= medY) return '#10b981'   // 좌상 - 고효율
    if (d.total >= medX && d.completionRate < medY) return '#f59e0b'   // 우하 - 진행중
    return '#9ca3af'   // 좌하 - 소규모
  }

  const CustomDot = (props) => {
    const { cx, cy, payload } = props
    const r = Math.max(8, Math.min(22, payload.total / 15))
    return (
      <circle
        cx={cx} cy={cy} r={r}
        fill={quadrantColor(payload)}
        fillOpacity={0.75}
        stroke={quadrantColor(payload)}
        strokeWidth={1.5}
        style={{ cursor: 'pointer' }}
        onClick={() => openListPanel(`전략기술: ${payload.name}`, records.filter(r => r.techArea === payload.name))}
      />
    )
  }

  const ScatterTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs max-w-[200px]">
        <p className="font-semibold text-gray-800 mb-1">{d.name}</p>
        <p className="text-gray-500">총 건수: <span className="text-gray-800 font-medium">{d.total}건</span></p>
        <p className="text-gray-500">제정완료율: <span className="text-blue-600 font-medium">{d.completionRate}%</span></p>
        <p className="text-gray-500">제정완료: {d['제정완료'] ?? 0}건</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* 4분면 매트릭스 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-gray-700">전략기술 포지셔닝 매트릭스</h3>
          <div className="flex gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"/>강점 (대량·고완료)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"/>고효율 (소량·고완료)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"/>진행중 (대량·저완료)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block"/>소규모 (소량·저완료)</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 mb-3">X축: 총 표준 건수 · Y축: 제정완료율(%) · 버블 크기: 건수 비례</p>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <XAxis type="number" dataKey="total" name="건수" label={{ value: '총 건수', position: 'insideBottom', offset: -10, fontSize: 11 }} tick={{ fontSize: 11 }} />
            <YAxis type="number" dataKey="completionRate" name="완료율" label={{ value: '완료율(%)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }} tick={{ fontSize: 11 }} domain={[0, 100]} />
            <ZAxis range={[60, 400]} />
            <Tooltip content={<ScatterTooltip />} />
            <ReferenceLine x={medX} stroke="#e5e7eb" strokeDasharray="4 3" label={{ value: `중앙값 ${medX}`, fontSize: 10, fill: '#9ca3af' }} />
            <ReferenceLine y={medY} stroke="#e5e7eb" strokeDasharray="4 3" label={{ value: `${medY}%`, fontSize: 10, fill: '#9ca3af', position: 'insideTopRight' }} />
            <Scatter data={techData} shape={<CustomDot />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* 상태별 누적 바 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">전략기술별 상태 분포</h3>
          <div className="flex gap-1">
            {[['total', '건수순'], ['completion', '완료율순'], ['name', '이름순']].map(([k, l]) => (
              <button key={k} onClick={() => setSortKey(k)}
                className={`text-[10px] px-2 py-1 rounded ${sortKey === k ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={Math.max(280, sorted.length * 28)}>
          <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 50 }}>
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="shortName" width={80} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v, n) => [`${v}건`, n]} />
            <Legend iconSize={9} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            {STATUS_ORDER.map(s => (
              <Bar key={s} dataKey={s} stackId="a" fill={STATUS_CHART_COLORS[s] ?? '#9ca3af'}
                cursor="pointer"
                onClick={d => openListPanel(`${d.name} > ${s}`, records.filter(r => r.techArea === d.name && r.status === s))}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 상세 테이블 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">전략기술별 상세 현황</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-3 text-gray-500 font-medium">전략기술</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">합계</th>
                {STATUS_ORDER.map(s => (
                  <th key={s} className="text-right py-2 px-2 text-gray-500 font-medium">{s}</th>
                ))}
                <th className="text-right py-2 pl-2 text-gray-500 font-medium">완료율</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map(d => (
                <tr key={d.name} className="hover:bg-blue-50 cursor-pointer"
                  onClick={() => openListPanel(`전략기술: ${d.name}`, records.filter(r => r.techArea === d.name))}>
                  <td className="py-2 pr-3 text-gray-700 font-medium">{d.shortName}</td>
                  <td className="py-2 px-2 text-right font-semibold text-gray-800">{d.total}</td>
                  {STATUS_ORDER.map(s => (
                    <td key={s} className="py-2 px-2 text-right text-gray-600">{d[s] ?? 0}</td>
                  ))}
                  <td className="py-2 pl-2 text-right">
                    <span className={`font-semibold ${d.completionRate >= 60 ? 'text-blue-600' : d.completionRate >= 30 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {d.completionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
