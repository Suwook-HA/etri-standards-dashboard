import { useState } from 'react'
import useStore from '../../store/useStore'
import VersionHistory from './VersionHistory'

export default function Header() {
  const { dataDate, setAppState, globalSearch, setGlobalSearch } = useStore()
  const [showHistory, setShowHistory] = useState(false)

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3 shrink-0">
        {/* Logo + title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
          <span className="text-base font-semibold text-gray-800 whitespace-nowrap">ETRI 표준화 현황 대시보드</span>
        </div>

        {/* Global search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              placeholder="표준 제목, 번호, 기고자, 기구 검색..."
              className="w-full text-xs border border-gray-200 rounded-lg pl-8 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm leading-none"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {globalSearch && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg whitespace-nowrap">
              검색 필터 적용 중
            </span>
          )}
          {dataDate && (
            <span className="text-xs text-gray-400 whitespace-nowrap">데이터 기준: {dataDate}</span>
          )}
          <button
            onClick={() => setShowHistory(true)}
            className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 flex items-center gap-1.5 whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            버전 이력
          </button>
          <button
            onClick={() => setAppState('upload')}
            className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 flex items-center gap-1.5 whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            데이터 관리
          </button>
        </div>
      </header>

      {showHistory && <VersionHistory onClose={() => setShowHistory(false)} />}
    </>
  )
}
