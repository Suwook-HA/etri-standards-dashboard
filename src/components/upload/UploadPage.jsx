import { useState, useRef } from 'react'
import useStore from '../../store/useStore'
import { parseXlsx } from '../../utils/xlsxParser'
import { validateData } from '../../utils/validation'

export default function UploadPage() {
  const [dragging, setDragging] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState(null)
  const inputRef = useRef(null)

  const {
    uploadMemo, setUploadMemo,
    setUploadFileName, setPendingRecords, setPendingHeaders,
    setValidationResult, setAppState,
  } = useStore()

  async function handleFile(file) {
    if (!file) return
    if (!file.name.endsWith('.xlsx')) {
      setParseError('.xlsx 파일만 업로드 가능합니다.')
      return
    }
    setParseError(null)
    setParsing(true)
    setUploadFileName(file.name)
    try {
      const { headers, records } = await parseXlsx(file)
      const result = validateData(headers, records)
      setPendingHeaders(headers)
      setPendingRecords(records)
      setValidationResult(result)
      setAppState('validating')
    } catch (e) {
      setParseError(`파일 파싱 오류: ${e.message}`)
    } finally {
      setParsing(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  function onInputChange(e) {
    handleFile(e.target.files[0])
    e.target.value = ''
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">데이터 갱신</h1>
        <p className="text-sm text-gray-500 mt-1">전수조사 완료 후 엑셀 파일을 업로드하여 대시보드를 갱신합니다.</p>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
          ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={onInputChange}
        />
        {parsing ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">파일 파싱 중...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-700">엑셀 파일을 여기에 드래그하거나 클릭하여 선택</p>
              <p className="text-xs text-gray-400 mt-1">지원 형식: .xlsx · 최대 50MB</p>
            </div>
          </div>
        )}
      </div>

      {parseError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {parseError}
        </div>
      )}

      {/* Memo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          갱신 메모 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <input
          type="text"
          value={uploadMemo}
          onChange={e => setUploadMemo(e.target.value)}
          placeholder="예) 2026년 전수조사 결과 반영 (AI안전연구소 신규 추가)"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}
