import { get, set, del, keys } from 'idb-keyval'

const CONFIG_KEY = '__config__'
const MAX_VERSIONS = 5

function versionDataKey(v) { return `version_data_${v}` }
function versionMetaKey(v) { return `version_meta_${v}` }
function changesetKey(v)    { return `changeset_${v}` }

/** Load config. Returns { activeVersion, versions: number[] } */
export async function loadConfig() {
  const cfg = await get(CONFIG_KEY)
  return cfg ?? { activeVersion: null, versions: [] }
}

async function saveConfig(cfg) {
  await set(CONFIG_KEY, cfg)
}

/** Load the active dataset. Returns records[] or [] */
export async function loadActiveData() {
  const cfg = await loadConfig()
  if (!cfg.activeVersion) return []
  return (await get(versionDataKey(cfg.activeVersion))) ?? []
}

/** Load version metadata list for the history panel */
export async function loadVersionHistory() {
  const cfg = await loadConfig()
  const items = await Promise.all(
    cfg.versions.map(async v => {
      const [meta, changeset] = await Promise.all([
        get(versionMetaKey(v)),
        get(changesetKey(v)),
      ])
      return { version: v, ...meta, changeset }
    })
  )
  return items.sort((a, b) => b.version - a.version)
}

/** Load a specific version's data */
export async function loadVersionData(versionNo) {
  return (await get(versionDataKey(versionNo))) ?? []
}

/** Load a specific version's changeset */
export async function loadChangeset(versionNo) {
  return await get(changesetKey(versionNo))
}

/**
 * Save a new version and set it as active.
 * Rotates out the oldest version if > MAX_VERSIONS.
 *
 * @param {object[]} records   - full flat record array (all _changeType resolved)
 * @param {object}   changeset - { new[], modified[], removed[], unchanged[] }
 * @param {object}   meta      - { date, memo, warnings, totalCount }
 * @returns {number} new version number
 */
export async function saveVersion(records, changeset, meta) {
  const cfg = await loadConfig()
  const newVersion = (cfg.activeVersion ?? 0) + 1

  // Save data, meta, changeset
  await set(versionDataKey(newVersion), records)
  await set(versionMetaKey(newVersion), { ...meta, version: newVersion })
  await set(changesetKey(newVersion), changeset)

  // Update config
  const versions = [...cfg.versions, newVersion]

  // Prune oldest if over limit
  if (versions.length > MAX_VERSIONS) {
    const toRemove = versions.splice(0, versions.length - MAX_VERSIONS)
    await Promise.all(toRemove.flatMap(v => [
      del(versionDataKey(v)),
      del(versionMetaKey(v)),
      del(changesetKey(v)),
    ]))
  }

  await saveConfig({ activeVersion: newVersion, versions })
  return newVersion
}

/**
 * Restore a previous version as active.
 * Saves current active as a new snapshot first.
 */
export async function restoreVersion(targetVersionNo) {
  const cfg = await loadConfig()
  if (!cfg.activeVersion || cfg.activeVersion === targetVersionNo) return

  // Snapshot current active data as a new version (without changeset)
  const currentData = await loadActiveData()
  const currentMeta = (await get(versionMetaKey(cfg.activeVersion))) ?? {}
  await saveVersion(
    currentData,
    { new: [], modified: [], removed: [], unchanged: currentData },
    { ...currentMeta, memo: `[복원 전 자동 저장] ${currentMeta.memo ?? ''}` }
  )

  // Set target as active
  const newCfg = await loadConfig()
  newCfg.activeVersion = targetVersionNo
  await saveConfig(newCfg)
}

/** Check if any version data exists */
export async function hasData() {
  const cfg = await loadConfig()
  return cfg.activeVersion !== null && cfg.versions.length > 0
}
