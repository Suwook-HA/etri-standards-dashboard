import { useState } from 'react'
import useStore from '../../store/useStore'
import { calcDiff } from '../../utils/diff'
import { loadActiveData } from '../../utils/versionStorage'

export default function ValidationPage() {
  const [proceeding, setProceeding] = useState(false)
  const [warningAck, setWarningAck] = useState(false)

  const {
    validationResult, pendingRecords, uploadFileName, activeVersion,
    setDiffResult, setAppState, records,
  } = useStore()

  if (!validationResult) return null
  const { errors, warnings, passed } = validationResult

  async function proceed() {
    setProceeding(true)
    try {
      const prevRecords = records.length > 0 ? records : await loadActiveData()
      const newVersionNo = (activeVersion ?? 0) + 1
      const diff = calcDiff(prevRecords, pendingRecords, newVersionNo)
      setDiffResult(diff)
      setAppState('diffing')
    } finally {
      setProceeding(false)
    }
  }

  const allPass = errors.length === 0 && warnings.length === 0
  const canProceed = errors.length === 0 && (warnings.length === 0 || warningAck)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">유효성 검사 결과</h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">{uploadFileName}</p>
      </div>

      {/* Overall status */}
      <div className={`rounded-xl px-5 py-4 flex items-center gap-3 ${
        errors.length > 0 ? 'bg-red-50 border border-red-200' :
        warnings.length > 0 ? 'bg-yellow-50 border border-yellow-200' :
        'bg-green-50 border border-green-200'
      }`}>
        {errors.length > 0 ? (
          <>
            <span className="text-red-500 text-xl">✕</span>
            <div>
              <p className="font-medium text-red-700">오류 {errors.length}건 발견 — 파일을 수정 후 재업로드하세요</p>
              <p className="text-sm text-red-600">오류가 해결되기 전까지 다음 단계로 진행할 수 없습니다.</p>
            </div>
          </>
        ) : warnings.length > 0 ? (
          <>
            <span className="text-yellow-500 text-xl">⚠</span>
            <div>
              <p className="font-medium text-yellow-700">경고 {warnings.length}건 — 내용 확인 후 진행 가능</p>
              <p className="text-sm text-yellow-600">경고 항목을 확인하고 계속 진행하려면 아래 체크박스를 선택하세요.</p>
            </div>
          </>
        ) : (
          <>
            <span className="text-green-500 text-xl">✓</span>
            <p className="font-medium text-green-700">모든 검사 통과 — 다음 단계로 이동합니다</p>
          </>
        )}
      </div>

      {/* Errors */}
      {errors.map((err, i) => (
        <IssueCard key={i} type="error" item={err} />
      ))}

      {/* Warnings */}
      {warnings.map((w, i) => (
        <IssueCard key={i} type="warning" item={w} />
      ))}

      {/* Warning acknowledgement */}
      {warnings.length > 0 && errors.length === 0 && (
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={warningAck}
            onChange={e => setWarningAck(e.target.checked)}
            className="rounded border-gray-300 text-blue-600"
          />
          경고 내용을 확인했으며, 이 상태로 계속 진행합니다.
        </label>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => useStore.getState().setAppState('upload')}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← 다시 업로드
        </button>
        {canProceed && (
          <button
            onClick={proceed}
            disabled={proceeding}
            className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {proceeding && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            변경사항 미리보기 →
          </button>
        )}
      </div>
    </div>
  )
}

function IssueCard({ type, item }) {
  const [open, setOpen] = useState(false)
  const isError = type === 'error'
  return (
    <div className={`rounded-lg border p-4 ${isError ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${isError ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
            {isError ? '오류' : '경고'}
          </span>
          <span className="text-sm font-medium text-gray-800">{item.message}</span>
        </div>
        {item.detail?.length > 0 && (
          <span className="text-xs text-gray-400">{open ? '▲' : '▼'} 상세보기</span>
        )}
      </div>
      {open && item.detail?.length > 0 && (
        <div className="mt-3 space-y-1 max-h-48 overflow-auto">
          {item.detail.map((d, i) => (
            <div key={i} className="text-xs text-gray-600 font-mono bg-white bg-opacity-60 px-2 py-1 rounded">
              {d.row && <span className="text-gray-400 mr-2">행 {d.row}</span>}
              <span>{d.value ?? d.message ?? JSON.stringify(d)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
