import { useEffect, useState } from 'react'
import useStore from '../../store/useStore'
import { loadVersionHistory, loadVersionData, restoreVersion } from '../../utils/versionStorage'

export default function VersionHistory({ onClose }) {
  const { activeVersion, setRecords, setDataDate, setActiveVersion, setAppState } = useStore()
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(null)
  const [confirmRestore, setConfirmRestore] = useState(null)

  useEffect(() => {
    loadVersionHistory().then(list => {
      setVersions(list)
      setLoading(false)
    })
  }, [])

  async function handleRestore(versionNo) {
    setRestoring(versionNo)
    try {
      await restoreVersion(versionNo)
      const data = await loadVersionData(versionNo)
      const meta = versions.find(v => v.version === versionNo)
      setRecords(data)
      if (meta?.date) setDataDate(meta.date)
      setActiveVersion(versionNo)
    } finally {
      setRestoring(null)
      setConfirmRestore(null)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-800">버전 이력</h2>
            <p className="text-xs text-gray-400 mt-0.5">최근 5개 버전이 저장됩니다. 이전 버전으로 복원할 수 있습니다.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light leading-none">×</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5">
          {loading ? (
            <div className="text-center py-10 text-gray-400 text-sm">로딩 중...</div>
          ) : versions.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">저장된 버전이 없습니다.</div>
          ) : (
            <div className="space-y-3">
              {versions.map(v => (
                <VersionCard
                  key={v.version}
                  v={v}
                  isActive={v.version === activeVersion}
                  onRestore={() => setConfirmRestore(v.version)}
                  restoring={restoring === v.version}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="text-xs px-3 py-1.5 text-gray-500 hover:text-gray-700">닫기</button>
          <button
            onClick={() => { onClose(); setAppState('upload') }}
            className="text-xs px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            새 버전 업로드 →
          </button>
        </div>
      </div>

      {/* Restore confirmation */}
      {confirmRestore !== null && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          onClick={() => setConfirmRestore(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">버전 복원 확인</h3>
            <p className="text-xs text-gray-600 mb-4">
              v{confirmRestore}로 복원하면 현재 대시보드 데이터가 교체됩니다. 계속하시겠습니까?
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmRestore(null)}
                className="text-xs px-3 py-1.5 text-gray-500 hover:text-gray-700">취소</button>
              <button
                onClick={() => handleRestore(confirmRestore)}
                disabled={restoring !== null}
                className="text-xs px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {restoring !== null ? '복원 중...' : '복원'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function VersionCard({ v, isActive, onRestore, restoring }) {
  const newCount = v.changeset?.new?.length ?? 0
  const modCount = v.changeset?.modified?.length ?? 0
  const delCount = v.changeset?.removed?.length ?? 0
  const total = v.totalCount ?? 0

  return (
    <div className={`border rounded-xl p-4 ${isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">v{v.version}</span>
            {isActive && (
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">현재 활성</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-500">{v.date ?? '날짜 없음'}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-600 font-medium">{total.toLocaleString()}건</span>
          </div>
          {v.memo && (
            <p className="text-xs text-gray-600 mt-1.5 italic">"{v.memo}"</p>
          )}
          <div className="flex gap-2 mt-2">
            {newCount > 0 && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">+{newCount} 신규</span>}
            {modCount > 0 && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">~{modCount} 수정</span>}
            {delCount > 0 && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">-{delCount} 삭제</span>}
            {newCount === 0 && modCount === 0 && delCount === 0 && (
              <span className="text-[10px] text-gray-400">변경 없음</span>
            )}
          </div>
        </div>
        {!isActive && (
          <button onClick={onRestore} disabled={restoring}
            className="ml-3 text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 shrink-0">
            {restoring ? '복원 중...' : '복원'}
          </button>
        )}
      </div>
    </div>
  )
}
