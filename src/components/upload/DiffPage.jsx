import { useState } from 'react'
import useStore from '../../store/useStore'
import { saveVersion } from '../../utils/versionStorage'
import { flattenDiff } from '../../utils/diff'

const FIELD_LABELS = {
  status: '표준화 상태', techArea: '전략기술 분야', subTechArea: '세부중점기술',
  stdBody: '표준기구', workingGroup: '위원회/작업반', contributor: 'ETRI 기고자',
  editor: 'ETRI 에디터', endYear: '완료연도', startYear: '시작연도',
  title: '표준 제목', hasPatent: '표준특허 유무', institute: '소', department: '본부(단)',
}

const TAB_CONFIG = [
  { key: 'new',       label: '신규 추가', color: 'text-green-700',  badge: 'bg-green-100 text-green-800' },
  { key: 'modified',  label: '내용 수정', color: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
  { key: 'removed',   label: '삭제',      color: 'text-red-700',    badge: 'bg-red-100 text-red-800' },
  { key: 'unchanged', label: '변경 없음', color: 'text-gray-500',   badge: 'bg-gray-100 text-gray-600' },
]

export default function DiffPage() {
  const [activeTab, setActiveTab] = useState('new')
  const [expandedKeys, setExpandedKeys] = useState(new Set())
  const [applying, setApplying] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)

  const {
    diffResult, pendingRecords, uploadMemo, uploadFileName,
    validationResult, activeVersion,
    setRecords, setActiveVersion, setDataDate, setAppState,
  } = useStore()

  if (!diffResult) return null

  const tabRecords = {
    new: diffResult.new,
    modified: diffResult.modified,
    removed: diffResult.removed,
    unchanged: diffResult.unchanged,
  }
  const displayed = tabRecords[activeTab] ?? []
  const total = (diffResult.new?.length ?? 0) + (diffResult.modified?.length ?? 0) +
                (diffResult.removed?.length ?? 0) + (diffResult.unchanged?.length ?? 0)

  function toggleExpand(key) {
    setExpandedKeys(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  async function applyData() {
    setApplying(true)
    try {
      const newVersionNo = (activeVersion ?? 0) + 1
      // Build final records: mark _versionAdded for new records
      const allRecords = flattenDiff(diffResult).filter(r => r._changeType !== 'removed')
      const finalRecords = allRecords.map(r =>
        r._changeType === 'new' ? { ...r, _versionAdded: newVersionNo } : r
      )

      const meta = {
        date: new Date().toISOString().slice(0, 10),
        memo: uploadMemo,
        warnings: validationResult?.warnings ?? [],
        totalCount: finalRecords.length,
        fileName: uploadFileName,
      }

      const versionNo = await saveVersion(finalRecords, diffResult, meta)
      setRecords(finalRecords)
      setActiveVersion(versionNo)
      setDataDate(meta.date.slice(0, 7).replace('-', '-'))
      setAppState('dashboard')
    } finally {
      setApplying(false)
      setDeleteModal(false)
    }
  }

  function onApplyClick() {
    if (diffResult.removed?.length > 0) {
      setDeleteModal(true)
    } else {
      applyData()
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">변경사항 미리보기</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-mono">{uploadFileName}</p>
        </div>
        <span className="text-sm text-gray-500">전체 {total.toLocaleString()}건</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TAB_CONFIG.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center gap-2 transition-colors
              ${activeTab === t.key ? 'bg-white border border-b-white border-gray-200 -mb-px ' + t.color : 'text-gray-400 hover:text-gray-600'}`}
          >
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${t.badge}`}>
              {t.key === 'new' ? '+' : ''}{tabRecords[t.key]?.length ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Records */}
      <div className="space-y-1 max-h-[420px] overflow-y-auto">
        {displayed.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">해당 항목이 없습니다</div>
        ) : (
          displayed.map((rec, i) => (
            <DiffRow
              key={rec._recordKey + i}
              rec={rec}
              expanded={expandedKeys.has(rec._recordKey)}
              onToggle={() => toggleExpand(rec._recordKey)}
            />
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <button
          onClick={() => useStore.getState().setAppState('validating')}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← 이전
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => useStore.getState().setAppState('upload')}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            취소
          </button>
          <button
            onClick={onApplyClick}
            disabled={applying}
            className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {applying && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            이 내용으로 적용하기
            {diffResult.removed?.length > 0 && (
              <span className="text-red-200 text-xs">삭제 {diffResult.removed.length}건 포함</span>
            )}
          </button>
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-base font-semibold text-gray-800 mb-2">삭제 항목 포함</h2>
            <p className="text-sm text-gray-600 mb-4">
              이번 업로드에는 <strong className="text-red-600">{diffResult.removed.length}건</strong>의 삭제 항목이 포함되어 있습니다.
              계속 진행하면 해당 항목이 대시보드에서 제거됩니다.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">취소</button>
              <button onClick={applyData} disabled={applying} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {applying ? '적용 중...' : '삭제 포함 적용'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DiffRow({ rec, expanded, onToggle }) {
  const typeConfig = {
    new:       { icon: '▲', bg: 'bg-green-50',  border: 'border-green-300',  label: '신규' },
    modified:  { icon: '✎', bg: 'bg-yellow-50', border: 'border-yellow-300', label: '수정' },
    removed:   { icon: '✕', bg: 'bg-red-50',    border: 'border-red-300',    label: '삭제' },
    unchanged: { icon: '─', bg: 'bg-white',      border: 'border-gray-100',  label: '-' },
  }
  const cfg = typeConfig[rec._changeType] ?? typeConfig.unchanged
  const hasChanges = rec._changeType === 'modified' && rec._changedFields?.length > 0

  return (
    <div className={`border rounded-lg ${cfg.bg} ${cfg.border}`}>
      <div
        className={`flex items-center gap-3 px-3 py-2 ${hasChanges ? 'cursor-pointer' : ''}`}
        onClick={hasChanges ? onToggle : undefined}
      >
        <span className="text-xs font-bold w-8 text-center text-gray-500">{cfg.icon}</span>
        <span className="text-xs font-mono text-gray-500 w-28 truncate">{rec.stdNo || '-'}</span>
        <span className="text-sm text-gray-800 flex-1 truncate" title={rec.title}>{rec.title}</span>
        {hasChanges && (
          <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
            {rec._changedFields.length}개 필드 변경 {expanded ? '▲' : '▼'}
          </span>
        )}
        {rec._changeType === 'new' && (
          <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">신규</span>
        )}
        {rec._changeType === 'removed' && (
          <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">삭제</span>
        )}
      </div>
      {expanded && hasChanges && (
        <div className="px-12 pb-3 space-y-1">
          {rec._changedFields.map((cf, i) => (
            <div key={i} className="text-xs flex items-start gap-2">
              <span className="text-gray-400 w-24 shrink-0">{FIELD_LABELS[cf.field] ?? cf.field}</span>
              <span className="text-red-500 line-through">{String(cf.oldVal || '(없음)')}</span>
              <span className="text-gray-400">→</span>
              <span className="text-green-700 font-medium">{String(cf.newVal || '(없음)')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
