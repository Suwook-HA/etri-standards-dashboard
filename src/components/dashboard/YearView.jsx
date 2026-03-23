import { useMemo } from 'react'
import useStore from '../../store/useStore'
import { STATUS_CHART_COLORS } from '../../utils/constants'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts'

const STATUS_ORDER = ['제정완료', '개발중', '제안중', '계획중', '개발중단']

export default function YearView() {
  const { getFilteredRecords, openListPanel } = useStore()
  const records = getFilteredRecords()

  // Completion trend by endYear
  const completionByYear = useMemo(() => {
    const map = {}
    records
      .filter(r => r.endYear && r.status === '제정완료')
      .forEach(r => { map[r.endYear] = (map[r.endYear] ?? 0) + 1 })
    return Object.entries(map)
      .sort((a, b) => a[0] - b[0])
      .map(([year, count]) => ({ year, count }))
  }, [records])

  // All statuses by endYear (stacked bar)
  const byEndYear = useMemo(() => {
    const map = {}
    records
      .filter(r => r.endYear)
      .forEach(r => {
        if (!map[r.endYear]) map[r.endYear] = { year: r.endYear }
        map[r.endYear][r.status] = (map[r.endYear][r.status] ?? 0) + 1
        map[r.endYear].total = (map[r.endYear].total ?? 0) + 1
      })
    return Object.values(map).sort((a, b) => a.year - b.year)
  }, [records])

  // By startYear
  const byStartYear = useMemo(() => {
    const map = {}
    records
      .filter(r => r.startYear)
      .forEach(r => {
        if (!map[r.startYear]) map[r.startYear] = { year: r.startYear, count: 0 }
        map[r.startYear].count++
      })
    return Object.values(map).sort((a, b) => a.year - b.year)
  }, [records])

  // Cumulative completions
  const cumulative = useMemo(() => {
    let cum = 0
    return completionByYear.map(d => {
      cum += d.count
      return { ...d, cumulative: cum }
    })
  }, [completionByYear])

  // Yearly stats table
  const yearStats = useMemo(() => {
    const years = new Set([
      ...records.filter(r => r.endYear).map(r => r.endYear),
    ])
    return [...years].sort((a, b) => b - a).map(year => {
      const recs = records.filter(r => r.endYear === year)
      const counts = {}
      recs.forEach(r => { counts[r.status] = (counts[r.status] ?? 0) + 1 })
      return { year, total: recs.length, ...counts, recs }
    })
  }, [records])

  return (
    <div className="space-y-5">
      {/* Line: cumulative completions + annual */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">연도별 제정완료 추이</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={cumulative} margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend iconSize={9} wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="count" name="당해 연도 제정" fill="#93c5fd" cursor="pointer"
              onClick={d => openListPanel(`${d.year}년 제정완료`, records.filter(r => r.endYear === d.year && r.status === '제정완료'))}
            />
            <Line yAxisId="right" type="monotone" dataKey="cumulative" name="누적 제정완료"
              stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stacked bar: all statuses by endYear */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">완료연도별 상태 분포</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byEndYear} margin={{ left: 0, right: 16 }}>
            <XAxis dataKey="year" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v, n) => [`${v}건`, n]} />
            <Legend iconSize={9} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            {STATUS_ORDER.map(s => (
              <Bar key={s} dataKey={s} stackId="a" fill={STATUS_CHART_COLORS[s] ?? '#9ca3af'}
                cursor="pointer"
                onClick={d => openListPanel(`${d.year}년 > ${s}`, records.filter(r => r.endYear === d.year && r.status === s))}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Start year distribution */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">시작연도별 신규 착수 건수</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={byStartYear} margin={{ left: 0, right: 16 }}>
            <XAxis dataKey="year" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v}건`]} />
            <Bar dataKey="count" name="착수 건수" fill="#6ee7b7" cursor="pointer"
              onClick={d => openListPanel(`${d.year}년 착수`, records.filter(r => r.startYear === d.year))}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Year detail table */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">연도별 상세 현황</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-3 text-gray-500 font-medium">완료연도</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">합계</th>
                {STATUS_ORDER.map(s => (
                  <th key={s} className="text-right py-2 px-2 text-gray-500 font-medium">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {yearStats.map(d => (
                <tr key={d.year} className="hover:bg-blue-50 cursor-pointer"
                  onClick={() => openListPanel(`${d.year}년 완료 표준`, d.recs)}>
                  <td className="py-2 pr-3 text-gray-700 font-medium">{d.year}년</td>
                  <td className="py-2 px-2 text-right font-semibold text-gray-800">{d.total}</td>
                  {STATUS_ORDER.map(s => (
                    <td key={s} className="py-2 px-2 text-right text-gray-600">{d[s] ?? 0}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
