import * as XLSX from 'xlsx'

const EXPORT_COLS = [
  { key: 'institute',     label: '직할부서' },
  { key: 'department',    label: '부서' },
  { key: 'title',         label: '표준 제목' },
  { key: 'stdNo',         label: '표준번호' },
  { key: 'stdBody',       label: '표준기구' },
  { key: 'workingGroup',  label: '위원회/작업반' },
  { key: 'status',        label: '표준화 상태' },
  { key: 'startYear',     label: '시작연도' },
  { key: 'endYear',       label: '완료연도' },
  { key: 'techArea',      label: '전략기술 분야' },
  { key: 'subTechArea',   label: '세부중점기술' },
  { key: 'contributor',   label: 'ETRI 기고자' },
  { key: 'editor',        label: 'ETRI 에디터' },
  { key: 'chairPosition', label: 'ETRI 의장단' },
  { key: 'projectType',   label: '사업분류' },
  { key: 'fundingAgency', label: '출연처' },
  { key: 'hasPatent',     label: '표준특허 유무' },
  { key: 'patentCount',   label: '표준특허 개수' },
  { key: 'patentStatus',  label: '특허상태' },
  { key: 'patentCountry', label: '출원국가' },
  { key: 'inventor',      label: '발명자' },
  { key: 'abstract',      label: '표준 주요 내용' },
]

/**
 * Export filtered records to .xlsx and trigger browser download.
 * @param {object[]} records  - filtered record array
 * @param {string}   context  - sheet/file name hint (e.g. filter description)
 */
export function exportToExcel(records, context = '') {
  const header = EXPORT_COLS.map(c => c.label)
  const rows = records.map(r =>
    EXPORT_COLS.map(c => {
      const v = r[c.key]
      return v === null || v === undefined ? '' : v
    })
  )

  const wsData = [header, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Column widths
  ws['!cols'] = EXPORT_COLS.map(c =>
    ['title', 'abstract', 'subTechArea'].includes(c.key)
      ? { wch: 40 }
      : { wch: 16 }
  )

  // Bold header row
  const range = XLSX.utils.decode_range(ws['!ref'])
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })]
    if (cell) {
      cell.s = { font: { bold: true }, fill: { fgColor: { rgb: 'DBEAFE' } } }
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '표준화현황')

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = context ? `_${context.replace(/[^\w가-힣]/g, '_').slice(0, 20)}` : ''
  const filename = `ETRI_표준화현황${suffix}_${dateStr}.xlsx`

  XLSX.writeFile(wb, filename)
}
