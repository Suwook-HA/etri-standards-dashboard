import { useState, useMemo } from 'react'
import useStore from '../../store/useStore'
import { STATUS_CHART_COLORS } from '../../utils/constants'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const STATUS_ORDER = ['제정완료', '개발중', '제안중', '계획중', '개발중단']

export default function DeptView() {
  const { getFilteredRecords, openListPanel } = useStore()
  const records = getFilteredRecords()
  const [drillInstitute, setDrillInstitute] = useState(null)

  const instituteData = useMemo(() => {
    const map = {}
    records.forEach(r => {
      const key = r.institute || '(미지정)'
      if (!map[key]) map[key] = { name: key, total: 0 }
      map[key].total++
      map[key][r.status] = (map[key][r.status] ?? 0) + 1
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [records])

  const deptData = useMemo(() => {
    if (!drillInstitute) return []
    const filtered = records.filter(r => r.institute === drillInstitute)
    const map = {}
    filtered.forEach(r => {
      const key = r.department || '(미지정)'
      if (!map[key]) map[key] = { name: key, total: 0 }
      map[key].total++
      map[key][r.status] = (map[key][r.status] ?? 0) + 1
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [records, drillInstitute])

  const drillRecords = drillInstitute ? records.filter(r => r.institute === drillInstitute) : []

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => setDrillInstitute(null)}
          className={`font-medium ${!drillInstitute ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
          전체 부서
        </button>
        {drillInstitute && (
          <>
            <span className="text-gray-300">/</span>
            <span className="font-medium text-blue-600">{drillInstitute}</span>
            <span className="text-xs text-gray-400">({drillRecords.length}건)</span>
          </>
        )}
      </div>

      {!drillInstitute ? (
        <>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-1">직할부서별 현황</h3>
            <p className="text-[10px] text-gray-400 mb-3">막대 클릭 시 해당 직할부서의 세부 부서 현황으로 드릴다운</p>
            <ResponsiveContainer width="100%" height={Math.max(260, instituteData.length * 30)}>
              <BarChart data={instituteData} layout="vertical" margin={{ left: 8, right: 50 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v, n) => [`${v}건`, n]} />
                <Legend iconSize={9} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                {STATUS_ORDER.map(s => (
                  <Bar key={s} dataKey={s} stackId="a" fill={STATUS_CHART_COLORS[s] ?? '#9ca3af'}
                    cursor="pointer"
                    onClick={d => setDrillInstitute(d.name)}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">직할부서별 상세 현황</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-3 text-gray-500 font-medium">직할부서</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">합계</th>
                  {STATUS_ORDER.map(s => (
                    <th key={s} className="text-right py-2 px-2 text-gray-500 font-medium">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {instituteData.map(d => (
                  <tr key={d.name} className="hover:bg-blue-50 cursor-pointer"
                    onClick={() => setDrillInstitute(d.name)}>
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
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">{drillInstitute} — 세부 부서별 현황</h3>
              <button onClick={() => openListPanel(`부서: ${drillInstitute}`, drillRecords)}
                className="text-xs text-blue-600 hover:underline">전체 목록 →</button>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(240, deptData.length * 28)}>
              <BarChart data={deptData} layout="vertical" margin={{ left: 8, right: 50 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v, n) => [`${v}건`, n]} />
                <Legend iconSize={9} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                {STATUS_ORDER.map(s => (
                  <Bar key={s} dataKey={s} stackId="a" fill={STATUS_CHART_COLORS[s] ?? '#9ca3af'}
                    cursor="pointer"
                    onClick={d => openListPanel(
                      `${drillInstitute} > ${d.name}`,
                      drillRecords.filter(r => r.department === d.name)
                    )}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">세부 부서별 상세 현황</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-3 text-gray-500 font-medium">부서</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">합계</th>
                  {STATUS_ORDER.map(s => (
                    <th key={s} className="text-right py-2 px-2 text-gray-500 font-medium">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deptData.map(d => (
                  <tr key={d.name} className="hover:bg-blue-50 cursor-pointer"
                    onClick={() => openListPanel(`${drillInstitute} > ${d.name}`, drillRecords.filter(r => r.department === d.name))}>
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
