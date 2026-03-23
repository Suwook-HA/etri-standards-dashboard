import * as XLSX from 'xlsx'
import { COL } from './constants'

function normalizeHeader(h) {
  return typeof h === 'string' ? h.trim() : String(h ?? '')
}

function toStr(v) {
  if (v === null || v === undefined) return ''
  return String(v).trim()
}

function toNum(v) {
  const n = Number(v)
  return isNaN(n) ? null : n
}

/** Map one raw row object → normalized record */
function mapRow(raw, headers) {
  // Build a header-normalized lookup
  const get = (fieldKey) => {
    const colName = COL[fieldKey]
    // Try exact match first, then trimmed match
    if (raw[colName] !== undefined) return raw[colName]
    const found = headers.find(h => h.trim() === colName.trim())
    return found !== undefined ? raw[found] : undefined
  }

  const stdBody = toStr(get('stdBody'))
  const stdNo   = toStr(get('stdNo'))
  const key = stdBody && stdNo ? `${stdBody}:${stdNo}` : toStr(get('title'))

  return {
    _recordKey:    key,
    _changeType:   'unchanged',
    _changedFields: [],
    _versionAdded: null,
    _lastModified: null,

    institute:     toStr(get('institute')),
    department:    toStr(get('department')),
    seq:           toStr(get('seq')),
    title:         toStr(get('title')),
    stdNo,
    stdBody,
    workingGroup:  toStr(get('workingGroup')),
    status:        toStr(get('status')),
    abstract:      toStr(get('abstract')),
    startYear:     toNum(get('startYear')),
    endYear:       toNum(get('endYear')),
    contributor:   toStr(get('contributor')),
    editor:        toStr(get('editor')),
    chairPosition: toStr(get('chairPosition')),
    projectType:   toStr(get('projectType')),
    fundingAgency: toStr(get('fundingAgency')),
    techArea:      toStr(get('techArea')),
    subTechArea:   toStr(get('subTechArea')),
    hasPatent:     toStr(get('hasPatent')),
    patentCount:   toNum(get('patentCount')) ?? 0,
    patentStatus:  toStr(get('patentStatus')),
    mgmtNo:        toStr(get('mgmtNo')),
    patentName:    toStr(get('patentName')),
    patentCountry: toStr(get('patentCountry')),
    inventor:      toStr(get('inventor')),
    changeTypeRaw: toStr(get('changeTypeRaw')),
  }
}

/**
 * Parse an xlsx File → { headers: string[], records: object[] }
 */
export async function parseXlsx(file) {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  // Use the first sheet (취합)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  // Get raw rows with header row as keys
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
  if (rawRows.length === 0) return { headers: [], records: [] }

  const headers = Object.keys(rawRows[0]).map(normalizeHeader)
  const records = rawRows.map(r => mapRow(r, headers))

  return { headers, records, sheetName, arrayBuffer }
}
