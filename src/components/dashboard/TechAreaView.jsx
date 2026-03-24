import { useState, useMemo } from 'react'
import useStore from '../../store/useStore'
import { STATUS_CHART_COLORS } from '../../utils/constants'
import { findTechGroup, STRATEGY_LABELS } from '../../data/techStrategyData'
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Legend,
} from 'recharts'

const STATUS_ORDER = ['제정완료', '개발중', '제안중', '계획중', '개발중단']

export default function TechAreaView() {
  const { getFilteredRecords, openListPanel } = useStore()
  const records = getFilteredRecords()
  const [sortKey, setSortKey] = useState('total')
  const [selectedTech, setSelectedTech] = useState(null)

  const techData = useMemo(() => {
    const map = {}
    records.forEach(r => {
      if (!r.techArea) return
      if (!map[r.techArea]) map[r.techArea] = { name: r.techArea, total: 0, editorCount: 0, chairCount: 0 }
      map[r.techArea].total++
      map[r.techArea][r.status] = (map[r.techArea][r.status] ?? 0) + 1
      if (r.editor) {
        map[r.techArea].editorCount += r.editor.split(',').filter(s => s.trim()).length
      }
      if (r.chairPosition) {
        map[r.techArea].chairCount += r.chairPosition.split(',').filter(s => s.trim()).length
      }
    })
    return Object.values(map).map(d => ({
      ...d,
      shortName: d.name.replace(/^\d+\) /, ''),
      // ETRI 리더십 지표: 에디터·의장단 합산 수 / 총건수 × 100
      leadershipRatio: Math.round(((d.editorCount + d.chairCount) / d.total) * 100),
    }))
  }, [records])

  const sorted = useMemo(() =>
    [...techData].sort((a, b) =>
      sortKey === 'total' ? b.total - a.total :
      sortKey === 'leadership' ? b.leadershipRatio - a.leadershipRatio :
      a.shortName.localeCompare(b.shortName)
    ), [techData, sortKey])

  // Quadrant medians
  const medX = useMemo(() => {
    const xs = techData.map(d => d.total).sort((a, b) => a - b)
    return xs[Math.floor(xs.length / 2)] ?? 50
  }, [techData])
  const medY = useMemo(() => {
    const ys = techData.map(d => d.leadershipRatio).sort((a, b) => a - b)
    return ys[Math.floor(ys.length / 2)] ?? 50
  }, [techData])

  const quadrantColor = (d) => {
    if (d.total >= medX && d.leadershipRatio >= medY) return '#3b82f6'
    if (d.total < medX && d.leadershipRatio >= medY) return '#10b981'
    if (d.total >= medX && d.leadershipRatio < medY) return '#f59e0b'
    return '#9ca3af'
  }

  function handleTechClick(techName) {
    setSelectedTech(prev => prev === techName ? null : techName)
  }

  const CustomDot = (props) => {
    const { cx, cy, payload } = props
    const r = Math.max(8, Math.min(22, payload.total / 15))
    return (
      <circle
        cx={cx} cy={cy} r={r}
        fill={quadrantColor(payload)}
        fillOpacity={selectedTech === payload.name ? 1 : 0.75}
        stroke={selectedTech === payload.name ? '#1d4ed8' : quadrantColor(payload)}
        strokeWidth={selectedTech === payload.name ? 2.5 : 1.5}
        style={{ cursor: 'pointer' }}
        onClick={() => handleTechClick(payload.name)}
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
        <p className="text-gray-500">리더십 지표: <span className="text-blue-600 font-medium">{d.leadershipRatio}</span></p>
        <p className="text-gray-500">에디터: {d.editorCount}명 · 의장단: {d.chairCount}명</p>
        <p className="text-blue-400 mt-1">클릭하여 세부기술 보기</p>
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
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"/>선도 (대량·고리더십)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"/>집중 (소량·고리더십)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"/>참여 (대량·성장형)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block"/>소규모 (소량·성장형)</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 mb-3">X축: 총 표준 건수 · Y축: ETRI 리더십 지표(에디터·의장단 합산 수/총건수×100) · 버블 크기: 건수 비례 · 클릭 시 세부기술 드릴다운</p>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <XAxis type="number" dataKey="total" name="건수" label={{ value: '총 건수', position: 'insideBottom', offset: -10, fontSize: 11 }} tick={{ fontSize: 11 }} />
            <YAxis type="number" dataKey="leadershipRatio" name="리더십지표" label={{ value: '리더십 지표', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }} tick={{ fontSize: 11 }} domain={[0, 'auto']} />
            <ZAxis range={[60, 400]} />
            <Tooltip content={<ScatterTooltip />} />
            <ReferenceLine x={medX} stroke="#e5e7eb" strokeDasharray="4 3" label={{ value: `중앙값 ${medX}`, fontSize: 10, fill: '#9ca3af' }} />
            <ReferenceLine y={medY} stroke="#e5e7eb" strokeDasharray="4 3" label={{ value: `중앙값 ${medY}%`, fontSize: 10, fill: '#9ca3af', position: 'insideTopRight' }} />
            <Scatter data={techData} shape={<CustomDot />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* ── 세부중점기술 드릴다운 ───────────────────── */}
      {selectedTech && (
        <SubTechDrilldown
          techName={selectedTech}
          records={records}
          onClose={() => setSelectedTech(null)}
          openListPanel={openListPanel}
        />
      )}

      {/* 상태별 누적 바 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">전략기술별 상태 분포</h3>
          <div className="flex gap-1">
            {[['total', '건수순'], ['leadership', '리더십순'], ['name', '이름순']].map(([k, l]) => (
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
                onClick={d => handleTechClick(d.name)}
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
                <th className="text-right py-2 pl-2 text-gray-500 font-medium">리더십지표</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map(d => (
                <tr key={d.name}
                  className={`cursor-pointer transition-colors ${selectedTech === d.name ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-blue-50'}`}
                  onClick={() => handleTechClick(d.name)}>
                  <td className="py-2 pr-3 text-gray-700 font-medium">{d.shortName}</td>
                  <td className="py-2 px-2 text-right font-semibold text-gray-800">{d.total}</td>
                  {STATUS_ORDER.map(s => (
                    <td key={s} className="py-2 px-2 text-right text-gray-600">{d[s] ?? 0}</td>
                  ))}
                  <td className="py-2 pl-2 text-right">
                    <span className={`font-semibold ${d.leadershipRatio >= 60 ? 'text-blue-600' : d.leadershipRatio >= 30 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {d.leadershipRatio}%
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

// ─────────────────────────────────────────────────────────────
// 세부중점기술 드릴다운 컴포넌트
// ─────────────────────────────────────────────────────────────

function SubTechDrilldown({ techName, records, onClose, openListPanel }) {
  const techGroup = findTechGroup(techName)
  const shortName = techName.replace(/^\d+\)\s*/, '')

  // 실제 데이터에서 세부기술별 집계
  const techRecords = records.filter(r => r.techArea === techName)
  const subTechStats = useMemo(() => {
    const map = {}
    techRecords.forEach(r => {
      const sub = r.subTechArea || '(미분류)'
      if (!map[sub]) map[sub] = { name: sub, total: 0 }
      map[sub].total++
      map[sub][r.status] = (map[sub][r.status] ?? 0) + 1
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [techRecords])

  // 정적 메타데이터와 병합
  const enriched = useMemo(() => {
    if (!techGroup) return subTechStats.map(s => ({ ...s, meta: null }))
    return subTechStats.map(s => {
      const meta = techGroup.subs.find(sub => {
        const sClean = s.name.replace(/^\d+[\.\)]\s*/, '').trim()
        const mClean = sub.name.trim()
        return sClean === mClean || sClean.includes(mClean) || mClean.includes(sClean)
      })
      return { ...s, meta }
    })
  }, [subTechStats, techGroup])

  // 정적 데이터에만 있고 실제 데이터에 없는 세부기술 (활동 없음 포함)
  const missingFromData = useMemo(() => {
    if (!techGroup) return []
    const dataNames = new Set(subTechStats.map(s => s.name.replace(/^\d+[\.\)]\s*/, '').trim()))
    return techGroup.subs.filter(sub => {
      return !Array.from(dataNames).some(dn => dn.includes(sub.name) || sub.name.includes(dn))
    })
  }, [techGroup, subTechStats])

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-blue-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            {shortName} — 세부중점기술 현황
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            총 {techRecords.length}건 · 세부기술 {subTechStats.length}개 분류
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openListPanel(`전략기술: ${techName}`, techRecords)}
            className="text-[10px] text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
          >
            전체 목록 보기 →
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" title="닫기">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 전략 범례 */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(STRATEGY_LABELS).map(([key, val]) => (
          <span key={key} className={`text-[10px] px-2 py-0.5 rounded-full ${val.bg}`}>
            {key}
          </span>
        ))}
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">활동없음</span>
      </div>

      {/* 세부기술별 상태 막대 + 전략 배지 */}
      <div className="space-y-1.5">
        {enriched.map(s => {
          const strategy = s.meta?.strategy
          const activity = s.meta?.activity ?? 0
          const subjects = s.meta?.subjects ?? []
          const maxCount = Math.max(...enriched.map(e => e.total), 1)
          return (
            <SubTechRow
              key={s.name}
              name={s.name}
              stats={s}
              strategy={strategy}
              activity={activity}
              subjects={subjects}
              maxCount={maxCount}
              onClick={() => openListPanel(
                `${shortName} > ${s.name}`,
                techRecords.filter(r => (r.subTechArea || '(미분류)') === s.name),
              )}
            />
          )
        })}

        {/* 데이터 없는 세부기술 표시 */}
        {missingFromData.map(sub => (
          <div key={sub.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-50 opacity-60">
            <span className="text-xs text-gray-400 w-40 shrink-0 truncate">{sub.name}</span>
            {sub.strategy && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${STRATEGY_LABELS[sub.strategy]?.bg ?? 'bg-gray-100 text-gray-500'}`}>
                {sub.strategy}
              </span>
            )}
            <span className="text-[10px] text-gray-300">표준화 활동 없음</span>
          </div>
        ))}
      </div>

      {/* 활동 비중 범례 */}
      <div className="flex items-center gap-2 text-[10px] text-gray-400 pt-1 border-t border-gray-100">
        <span>활동 비중:</span>
        {[1,2,3,4,5].map(n => (
          <span key={n} className="text-amber-400">{'★'.repeat(n)}</span>
        ))}
      </div>
    </div>
  )
}

function SubTechRow({ name, stats, strategy, activity, subjects, maxCount, onClick }) {
  const barWidth = Math.max(2, (stats.total / maxCount) * 100)

  return (
    <div
      className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      {/* 이름 */}
      <span className="text-xs text-gray-700 w-40 shrink-0 truncate font-medium" title={name}>
        {name}
      </span>

      {/* 전략 배지 */}
      <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${
        strategy ? (STRATEGY_LABELS[strategy]?.bg ?? 'bg-gray-100 text-gray-500') : 'bg-gray-100 text-gray-400'
      }`}>
        {strategy ?? '-'}
      </span>

      {/* 활동 비중 */}
      <span className="text-[10px] text-amber-400 w-14 shrink-0 text-center" title={`활동 비중 ${activity}`}>
        {activity > 0 ? '★'.repeat(activity) : <span className="text-gray-300">-</span>}
      </span>

      {/* 상태별 미니 바 */}
      <div className="flex-1 flex items-center gap-0.5 h-4">
        <div className="flex h-full rounded overflow-hidden" style={{ width: `${barWidth}%`, minWidth: '4px' }}>
          {STATUS_ORDER.map(s => {
            const cnt = stats[s] ?? 0
            if (cnt === 0) return null
            return (
              <div
                key={s}
                style={{
                  width: `${(cnt / stats.total) * 100}%`,
                  backgroundColor: STATUS_CHART_COLORS[s] ?? '#9ca3af',
                }}
                title={`${s}: ${cnt}건`}
              />
            )
          })}
        </div>
      </div>

      {/* 건수 */}
      <span className="text-xs font-semibold text-gray-600 w-10 text-right shrink-0">
        {stats.total}건
      </span>

      {/* 표준화 대상 + 화살표 */}
      <span
        className="text-gray-300 group-hover:text-blue-500 text-xs shrink-0"
        title={subjects.length > 0 ? `주요 표준화 대상: ${subjects.join(', ')}` : ''}
      >→</span>
    </div>
  )
}
