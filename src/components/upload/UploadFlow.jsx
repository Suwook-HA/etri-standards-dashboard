import useStore from '../../store/useStore'
import UploadPage from './UploadPage'
import ValidationPage from './ValidationPage'
import DiffPage from './DiffPage'

export default function UploadFlow() {
  const appState = useStore(s => s.appState)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Step indicator */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm">
          <span className={`font-medium ${appState === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}>
            ① 파일 업로드
          </span>
          <span className="text-gray-300">›</span>
          <span className={`font-medium ${appState === 'validating' ? 'text-blue-600' : 'text-gray-400'}`}>
            ② 유효성 검사
          </span>
          <span className="text-gray-300">›</span>
          <span className={`font-medium ${appState === 'diffing' ? 'text-blue-600' : 'text-gray-400'}`}>
            ③ 변경 미리보기
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {appState === 'upload'     && <UploadPage />}
        {appState === 'validating' && <ValidationPage />}
        {appState === 'diffing'    && <DiffPage />}
      </div>
    </div>
  )
}
