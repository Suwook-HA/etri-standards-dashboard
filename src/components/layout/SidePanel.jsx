import { useEffect } from 'react'
import useStore from '../../store/useStore'
import StandardList from '../panel/StandardList'
import StandardDetail from '../panel/StandardDetail'

export default function SidePanel() {
  const { sidePanel, panelHistory, goBackPanel, closePanel } = useStore()

  // Close on ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closePanel])

  if (!sidePanel) return null

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
        {panelHistory.length > 0 && (
          <button
            onClick={goBackPanel}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            ← 뒤로
          </button>
        )}
        <div className="flex-1 min-w-0">
          {sidePanel.type === 'list' && (
            <p className="text-xs text-gray-500 truncate">{sidePanel.context}</p>
          )}
          {sidePanel.type === 'detail' && (
            <p className="text-xs text-gray-500">표준 상세 정보</p>
          )}
        </div>
        <button
          onClick={closePanel}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none shrink-0"
          aria-label="패널 닫기"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {sidePanel.type === 'list'   && <StandardList records={sidePanel.records} context={sidePanel.context} />}
        {sidePanel.type === 'detail' && <StandardDetail record={sidePanel.record} />}
      </div>
    </div>
  )
}
