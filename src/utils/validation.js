import { REQUIRED_COLUMNS, VALID_STATUSES, TECH_AREAS, INSTITUTES } from './constants'

/**
 * Validate parsed headers and records.
 * Returns { errors: [], warnings: [], passed: boolean }
 */
export function validateData(headers, records) {
  const errors = []
  const warnings = []

  // --- ERRORS (block proceed) ---

  // 1. Minimum row count
  if (!records || records.length === 0) {
    errors.push({ code: 'EMPTY_FILE', message: '파일에 데이터가 없습니다 (빈 파일).' })
    return { errors, warnings, passed: false }
  }

  // 2. Required columns
  const normalizedHeaders = headers.map(h => h.trim())
  const missing = REQUIRED_COLUMNS.filter(
    col => !normalizedHeaders.some(h => h === col.trim())
  )
  if (missing.length > 0) {
    errors.push({
      code: 'MISSING_COLUMNS',
      message: `필수 컬럼 ${missing.length}개 누락`,
      detail: missing,
    })
  }

  if (errors.length > 0) return { errors, warnings, passed: false }

  // --- WARNINGS (can proceed with acknowledgement) ---

  // 3. 표준화 상태 범위
  const invalidStatusRows = []
  records.forEach((r, i) => {
    if (r.status && !VALID_STATUSES.includes(r.status)) {
      invalidStatusRows.push({ row: i + 2, value: r.status, title: r.title })
    }
  })
  if (invalidStatusRows.length > 0) {
    warnings.push({
      code: 'INVALID_STATUS',
      message: `비정상 표준화 상태 값 ${invalidStatusRows.length}건`,
      detail: invalidStatusRows.slice(0, 20),
    })
  }

  // 4. 완료연도 숫자 형식
  const invalidYearRows = []
  records.forEach((r, i) => {
    const raw = r.endYear
    if (raw !== null && raw !== undefined && raw !== '' && isNaN(Number(raw))) {
      invalidYearRows.push({ row: i + 2, value: raw, title: r.title })
    }
  })
  if (invalidYearRows.length > 0) {
    warnings.push({
      code: 'INVALID_YEAR',
      message: `완료연도 형식 오류 ${invalidYearRows.length}건 (숫자가 아닌 값)`,
      detail: invalidYearRows.slice(0, 20),
    })
  }

  // 5. 전략기술 분야 범위
  const unknownTechRows = []
  const unknownTechs = new Set()
  records.forEach((r, i) => {
    if (r.techArea && !TECH_AREAS.some(t => r.techArea.includes(t.replace(/\d+\) /, '')))) {
      // Check if it contains any known tech keyword
      const known = TECH_AREAS.some(t => r.techArea === t)
      if (!known) {
        unknownTechs.add(r.techArea)
        if (unknownTechRows.length < 10) unknownTechRows.push({ row: i + 2, value: r.techArea })
      }
    }
  })
  if (unknownTechs.size > 0) {
    warnings.push({
      code: 'UNKNOWN_TECH_AREA',
      message: `미등록 전략기술 분야 ${unknownTechs.size}종 발견`,
      detail: [...unknownTechs].map(v => ({ value: v })),
    })
  }

  // 6. 직할부서 인식 불가
  const unknownInstitutes = new Set()
  records.forEach(r => {
    if (r.institute && !INSTITUTES.some(inst => r.institute.includes(inst) || inst.includes(r.institute))) {
      unknownInstitutes.add(r.institute)
    }
  })
  if (unknownInstitutes.size > 0) {
    warnings.push({
      code: 'UNKNOWN_INSTITUTE',
      message: `미등록 직할부서 ${unknownInstitutes.size}종 발견`,
      detail: [...unknownInstitutes].map(v => ({ value: v })),
    })
  }

  return {
    errors,
    warnings,
    passed: errors.length === 0,
  }
}
