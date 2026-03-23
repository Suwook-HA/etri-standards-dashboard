import { useEffect } from 'react'
import useStore from './store/useStore'
import { hasData, loadActiveData, loadConfig } from './utils/versionStorage'
import UploadFlow from './components/upload/UploadFlow'
import DashboardLayout from './components/layout/DashboardLayout'

export default function App() {
  const { appState, setAppState, setRecords, setActiveVersion, setDataDate } = useStore()

  useEffect(() => {
    async function init() {
      try {
        const exists = await hasData()
        if (exists) {
          const [data, cfg] = await Promise.all([loadActiveData(), loadConfig()])
          setRecords(data)
          setActiveVersion(cfg.activeVersion)
          // derive data date from most recent record endYear or today
          const maxYear = Math.max(...data.map(r => r.endYear).filter(Boolean))
          setDataDate(isFinite(maxYear) ? `${maxYear}` : new Date().getFullYear().toString())
          setAppState('dashboard')
        } else {
          setAppState('upload')
        }
      } catch (e) {
        console.error('Init error', e)
        setAppState('upload')
      }
    }
    init()
  }, [])

  if (appState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm animate-pulse">로딩 중...</div>
      </div>
    )
  }

  if (appState === 'upload' || appState === 'validating' || appState === 'diffing') {
    return <UploadFlow />
  }

  return <DashboardLayout />
}
