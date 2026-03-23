import { useState } from 'react'
import useStore from '../../store/useStore'
import { STATUS_COLORS } from '../../utils/constants'
import { exportToExcel } from '../../utils/exportExcel'

const FIELD_LABELS = {
  status: '표준화 상태', techArea: '전략기술 분야', subTechArea: '세부중점기술',
  stdBody: '표준기구', workingGroup: '위원회/작업반', contributor: 'ETRI 기고자',
  editor: 'ETRI 에디터', endYear: '완료연도', startYear: '시작연도',
  title: '표준 제목', hasPatent: '표준특허 유무', institute: '직할부서',
  department: '부서', fundingAgency: '출연처', projectType: '사업분류',
}

export default function StandardDetail({ record: rec }) {
  const { openListPanel, records } = useStore()
  const [tab, setTab] = useState('info')

  if (!rec) return null

  function relatedNav(label, filterFn, context) {
    const related = records.filter(filterFn)
    openListPanel(context, related)
  }

  const changeTypeRaw = rec.changeTypeRaw
    ? (rec.changeTypeRaw === 'N' ? '신규(N)' : rec.changeTypeRaw === 'R' ? '갱신(R)' : rec.changeTypeRaw)
    : '-'

  const TABS = [
    { id: 'info',    label: '기본 정보' },
    { id: 'change',  label: rec._changeType === 'modified' ? `변경이력 (${rec._changedFields?.length ?? 0})` : '변경이력' },
    { id: 'related', label: '연관 탐색' },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Title block */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
        <h2 className="text-sm font-semibold text-gray-800 leading-relaxed">{rec.title}</h2>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[rec.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {rec.status}
          </span>
          {rec._changeType === 'new' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">신규</span>
          )}
          {rec._changeType === 'modified' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">수정</span>
          )}
          <button
            onClick={() => exportToExcel([rec], rec.stdNo || rec.title?.slice(0, 15))}
            className="ml-auto text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1"
            title="이 레코드 Excel 내보내기"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            내보내기
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-0.5 mt-3">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`text-xs px-3 py-1 rounded-lg transition-colors ${tab === t.id ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-400 hover:text-gray-600'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {tab === 'info' && (
          <>
            <Section title="표준 기본 정보">
              <Row label="표준번호" value={rec.stdNo} />
              <Row label="표준기구" value={rec.stdBody} />
              <Row label="위원회" value={rec.workingGroup} />
              <Row label="시작연도" value={rec.startYear} />
              <Row label="완료연도" value={rec.endYear} />
            </Section>

            {rec.abstract && (
              <Section title="표준 주요 내용">
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{rec.abstract}</p>
              </Section>
            )}

            <Section title="ETRI 참여 정보">
              <Row label="기고자" value={rec.contributor || '(없음)'} />
              <Row label="에디터" value={rec.editor || '(없음)'} />
              <Row label="의장단" value={rec.chairPosition || '(없음)'} />
            </Section>

            <Section title="분류 정보">
              <Row label="직할부서" value={`${rec.institute} › ${rec.department}`} />
              <Row label="전략기술" value={rec.techArea} />
              <Row label="세부기술" value={rec.subTechArea} />
              <Row label="사업분류" value={rec.projectType} />
              <Row label="출연처" value={rec.fundingAgency} />
            </Section>

            <Section title="표준특허 정보">
              <Row label="특허유무" value={rec.hasPatent} />
              <Row label="특허개수" value={rec.patentCount} />
              {rec.hasPatent === '유' && (
                <>
                  <Row label="특허상태" value={rec.patentStatus} />
                  <Row label="특허명" value={rec.patentName} />
                  <Row label="출원국가" value={rec.patentCountry} />
                  <Row label="발명자" value={rec.inventor} />
                </>
              )}
            </Section>
          </>
        )}

        {tab === 'change' && (
          <Section title="변경 이력">
            <Row label="변경여부" value={changeTypeRaw} />
            {rec._versionAdded && <Row label="추가 버전" value={`v${rec._versionAdded}`} />}
            {rec._changeType === 'modified' && rec._changedFields?.length > 0 ? (
              <div className="mt-3 space-y-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">이번 갱신에서 변경된 필드</p>
                {rec._changedFields.map((cf, i) => (
                  <div key={i} className="text-xs bg-gray-50 rounded-lg p-2.5 space-y-1.5">
                    <div className="font-medium text-gray-600">{FIELD_LABELS[cf.field] ?? cf.field}</div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] text-red-400 bg-red-50 px-1.5 py-0.5 rounded shrink-0">이전</span>
                      <span className="text-red-500 line-through break-all">{String(cf.oldVal || '(없음)')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded shrink-0">현재</span>
                      <span className="text-green-700 font-medium break-all">{String(cf.newVal || '(없음)')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-2">
                {rec._changeType === 'new' ? '이번 갱신에서 새로 추가된 표준입니다.' : '이번 갱신에서 변경된 내용이 없습니다.'}
              </p>
            )}
          </Section>
        )}

        {tab === 'related' && (
          <Section title="연관 탐색">
            <div className="flex flex-col gap-2">
              {rec.stdBody && (
                <RelButton
                  label={`같은 기구 (${rec.stdBody}) 표준 보기`}
                  onClick={() => relatedNav(null, r => r.stdBody === rec.stdBody, `표준기구: ${rec.stdBody}`)}
                />
              )}
              {rec.workingGroup && (
                <RelButton
                  label={`같은 작업반 (${rec.workingGroup}) 표준 보기`}
                  onClick={() => relatedNav(null, r => r.workingGroup === rec.workingGroup && r.stdBody === rec.stdBody, `${rec.stdBody} > ${rec.workingGroup}`)}
                />
              )}
              {rec.contributor && (
                <RelButton
                  label={`같은 기고자 (${rec.contributor.split(',')[0].trim()}) 표준 보기`}
                  onClick={() => relatedNav(null, r => r.contributor?.includes(rec.contributor.split(',')[0].trim()), `기고자: ${rec.contributor.split(',')[0].trim()}`)}
                />
              )}
              {rec.techArea && (
                <RelButton
                  label={`같은 전략기술 (${rec.techArea}) 표준 보기`}
                  onClick={() => relatedNav(null, r => r.techArea === rec.techArea, `전략기술: ${rec.techArea}`)}
                />
              )}
              {rec.department && (
                <RelButton
                  label={`같은 부서 (${rec.department}) 표준 보기`}
                  onClick={() => relatedNav(null, r => r.department === rec.department, `부서: ${rec.department}`)}
                />
              )}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function Row({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-gray-400 w-20 shrink-0">{label}</span>
      <span className="text-gray-700">{String(value)}</span>
    </div>
  )
}

function RelButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-left text-blue-600 hover:text-blue-800 hover:underline py-0.5"
    >
      → {label}
    </button>
  )
}
