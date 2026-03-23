// Fields excluded from diff comparison (system fields)
const SKIP_FIELDS = new Set([
  '_recordKey', '_changeType', '_changedFields', '_versionAdded', '_lastModified',
])

/**
 * Compare two records field-by-field.
 * Returns array of { field, oldVal, newVal }
 */
function diffFields(oldRec, newRec) {
  const changed = []
  const allKeys = new Set([...Object.keys(oldRec), ...Object.keys(newRec)])
  for (const key of allKeys) {
    if (SKIP_FIELDS.has(key)) continue
    const ov = oldRec[key] ?? ''
    const nv = newRec[key] ?? ''
    if (String(ov) !== String(nv)) {
      changed.push({ field: key, oldVal: ov, newVal: nv })
    }
  }
  return changed
}

/**
 * Calculate diff between previous data snapshot and new records.
 *
 * @param {object[]} prevRecords  - records from the active (previous) version
 * @param {object[]} newRecords   - records parsed from the new upload
 * @param {number}   newVersionNo - version number being applied
 * @returns {{ new: object[], modified: object[], removed: object[], unchanged: object[] }}
 */
export function calcDiff(prevRecords, newRecords, newVersionNo) {
  const prevMap = new Map(prevRecords.map(r => [r._recordKey, r]))
  const newMap  = new Map(newRecords.map(r => [r._recordKey, r]))

  const result = { new: [], modified: [], removed: [], unchanged: [] }

  // Process new records
  for (const rec of newRecords) {
    const prev = prevMap.get(rec._recordKey)
    if (!prev) {
      result.new.push({
        ...rec,
        _changeType: 'new',
        _versionAdded: newVersionNo,
        _lastModified: newVersionNo,
      })
    } else {
      const changedFields = diffFields(prev, rec)
      if (changedFields.length > 0) {
        result.modified.push({
          ...rec,
          _changeType: 'modified',
          _changedFields: changedFields,
          _versionAdded: prev._versionAdded,
          _lastModified: newVersionNo,
        })
      } else {
        result.unchanged.push({
          ...rec,
          _changeType: 'unchanged',
          _versionAdded: prev._versionAdded,
          _lastModified: prev._lastModified,
        })
      }
    }
  }

  // Records in prev but not in new → removed
  for (const rec of prevRecords) {
    if (!newMap.has(rec._recordKey)) {
      result.removed.push({ ...rec, _changeType: 'removed' })
    }
  }

  return result
}

/**
 * Flatten diff result into a single sorted array for display.
 * Order: new → modified → removed → unchanged
 */
export function flattenDiff(diff) {
  return [
    ...diff.new,
    ...diff.modified,
    ...diff.removed,
    ...diff.unchanged,
  ]
}
