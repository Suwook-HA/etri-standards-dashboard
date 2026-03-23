/**
 * generateDashboardHtml(records, dataDate)
 *
 * Builds a fully self-contained, server-free HTML file from the current
 * filtered records.  The result can be opened directly with file:// — no
 * Node.js, no Vite, no network requests required.
 *
 * Features included in the exported file
 * ────────────────────────────────────────
 *  • KPI summary cards (6종)
 *  • Status distribution – SVG doughnut chart
 *  • Tech-area distribution – SVG horizontal bar chart
 *  • Standards-body distribution – SVG horizontal bar chart
 *  • Full records table with
 *      - live search (title / stdNo / contributor / stdBody)
 *      - column sort (click header)
 *      - 신규/수정 badges
 *      - expandable abstract row
 *  • All inline CSS (no external stylesheets or CDN)
 */
export function generateDashboardHtml(records, dataDate) {
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })

  // ── KPI counts ─────────────────────────────────────────────────────────────
  const total       = records.length
  const finished    = records.filter(r => r.status === '제정완료').length
  const developing  = records.filter(r => r.status === '개발중').length
  const proposed    = records.filter(r => r.status === '제안중').length
  const planning    = records.filter(r => r.status === '계획중').length
  const patents     = records.filter(r => r.hasPatent === '유').length

  // ── Status distribution ────────────────────────────────────────────────────
  const STATUS_COLORS = {
    '제정완료': '#3b82f6',
    '개발중':   '#22c55e',
    '제안중':   '#eab308',
    '계획중':   '#a855f7',
    '개발중단': '#9ca3af',
  }
  const statusCounts = {}
  records.forEach(r => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1 })

  // ── Tech-area distribution ─────────────────────────────────────────────────
  const techCounts = {}
  records.forEach(r => { if (r.techArea) techCounts[r.techArea] = (techCounts[r.techArea] || 0) + 1 })
  const techEntries = Object.entries(techCounts).sort((a, b) => b[1] - a[1])

  // ── Standards-body distribution ────────────────────────────────────────────
  const bodyCounts = {}
  records.filter(r => r.stdBody).forEach(r => {
    bodyCounts[r.stdBody] = (bodyCounts[r.stdBody] || 0) + 1
  })
  const bodyEntries = Object.entries(bodyCounts).sort((a, b) => b[1] - a[1]).slice(0, 12)

  // ── SVG helpers ────────────────────────────────────────────────────────────
  function doughnut(counts, colors, size = 160) {
    const vals = Object.entries(counts)
    const sum  = vals.reduce((s, [, v]) => s + v, 0)
    if (sum === 0) return '<svg></svg>'
    const r = 60, cx = size / 2, cy = size / 2
    let angle = -Math.PI / 2
    const slices = vals.map(([label, val]) => {
      const pct   = val / sum
      const sweep = pct * 2 * Math.PI
      const x1 = cx + r * Math.cos(angle)
      const y1 = cy + r * Math.sin(angle)
      angle += sweep
      const x2 = cx + r * Math.cos(angle)
      const y2 = cy + r * Math.sin(angle)
      const large = sweep > Math.PI ? 1 : 0
      return { label, val, pct, x1, y1, x2, y2, large, color: colors[label] || '#d1d5db' }
    })
    const paths = slices.map(s =>
      `<path d="M${cx},${cy} L${s.x1.toFixed(1)},${s.y1.toFixed(1)} A${r},${r} 0 ${s.large},1 ${s.x2.toFixed(1)},${s.y2.toFixed(1)} Z"
        fill="${s.color}" stroke="white" stroke-width="2" />`
    ).join('\n')
    // inner hole
    const hole = `<circle cx="${cx}" cy="${cy}" r="36" fill="white"/>`
    const centerText = `<text x="${cx}" y="${cy - 5}" text-anchor="middle" font-size="18" font-weight="bold" fill="#1f2937">${sum}</text>
      <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="10" fill="#6b7280">총 표준</text>`
    // legend
    const legendItems = slices.map((s, i) => {
      const ly = i * 20 + 6
      return `<rect x="0" y="${ly}" width="12" height="12" rx="2" fill="${s.color}"/>
        <text x="18" y="${ly + 10}" font-size="11" fill="#374151">${s.label} (${s.val})</text>`
    }).join('\n')
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="overflow:visible">
        ${paths}${hole}${centerText}
        <g transform="translate(${size + 12}, 6)">${legendItems}</g>
      </svg>`
  }

  function hbar(entries, maxVal, palette, barHeight = 22, gap = 8) {
    const w = 300
    const rows = entries.map(([label, val], i) => {
      const barW = maxVal > 0 ? (val / maxVal) * w : 0
      const y = i * (barHeight + gap)
      const color = palette[i % palette.length]
      const shortLabel = label.length > 18 ? label.slice(0, 17) + '…' : label
      return `
        <g transform="translate(0,${y})">
          <text x="0" y="${barHeight - 6}" font-size="11" fill="#374151">${shortLabel}</text>
          <rect x="0" y="${barHeight + 2}" width="${barW.toFixed(0)}" height="${barHeight - 6}" rx="3" fill="${color}" opacity="0.85"/>
          <text x="${barW + 6}" y="${barHeight + barHeight - 2}" font-size="11" fill="#6b7280">${val}</text>
        </g>`
    }).join('\n')
    const totalH = entries.length * (barHeight + gap)
    return `<svg width="${w + 80}" height="${totalH}" viewBox="0 0 ${w + 80} ${totalH}">${rows}</svg>`
  }

  const TECH_PALETTE  = ['#3b82f6','#22c55e','#eab308','#a855f7','#ef4444','#f97316','#06b6d4','#84cc16','#ec4899','#14b8a6','#8b5cf6','#f59e0b']
  const BODY_PALETTE  = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16','#06b6d4','#a855f7']

  const statusSvg = doughnut(statusCounts, STATUS_COLORS, 180)
  const techMaxVal = techEntries.length ? techEntries[0][1] : 1
  const techSvg  = hbar(techEntries, techMaxVal, TECH_PALETTE)
  const bodyMaxVal = bodyEntries.length ? bodyEntries[0][1] : 1
  const bodySvg  = hbar(bodyEntries, bodyMaxVal, BODY_PALETTE)

  // ── Change type badge ──────────────────────────────────────────────────────
  function changeBadge(type) {
    if (type === 'new')      return '<span class="badge badge-new">신규</span>'
    if (type === 'modified') return '<span class="badge badge-mod">수정</span>'
    return ''
  }

  // ── Table rows (escape HTML) ───────────────────────────────────────────────
  const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

  const tableRows = records.map((r, idx) => {
    const badge = changeBadge(r._changeType)
    const abstract = r.abstract ? `<tr class="abstract-row" id="ab-${idx}" style="display:none">
        <td colspan="13" style="padding:8px 12px;background:#f8fafc;font-size:12px;color:#475569;border-bottom:1px solid #e2e8f0;">${esc(r.abstract)}</td>
      </tr>` : ''
    return `<tr class="data-row" onclick="toggleAbstract(${idx})" style="cursor:pointer">
      <td>${esc(r.seq)}</td>
      <td>${esc(r.institute)}</td>
      <td>${esc(r.department)}</td>
      <td>${badge}${esc(r.title)}</td>
      <td>${esc(r.stdNo)}</td>
      <td>${esc(r.stdBody)}</td>
      <td style="font-size:11px;color:#6b7280">${esc(r.workingGroup)}</td>
      <td><span class="status-pill status-${(r.status||'').replace(/[^가-힣a-zA-Z]/g,'')}">${esc(r.status)}</span></td>
      <td style="font-size:11px">${esc(r.techArea)}</td>
      <td style="text-align:center">${esc(r.startYear)}</td>
      <td style="text-align:center">${esc(r.endYear)}</td>
      <td style="font-size:11px">${esc(r.contributor)}</td>
      <td style="text-align:center">${r.hasPatent === '유' ? '<span style="color:#3b82f6;font-weight:600;">유</span>' : esc(r.hasPatent)}</td>
    </tr>${abstract}`
  }).join('\n')

  // ── Inline JSON for client-side search/sort ────────────────────────────────
  const safeJson = JSON.stringify(records.map(r => ({
    seq: r.seq, institute: r.institute, department: r.department,
    title: r.title, stdNo: r.stdNo, stdBody: r.stdBody,
    workingGroup: r.workingGroup, status: r.status, techArea: r.techArea,
    startYear: r.startYear, endYear: r.endYear, contributor: r.contributor,
    hasPatent: r.hasPatent, abstract: r.abstract, _changeType: r._changeType,
    fundingAgency: r.fundingAgency, editor: r.editor,
    mgmtNo: r.mgmtNo, patentCount: r.patentCount,
  }))).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')

  // ══════════════════════════════════════════════════════════════════════════
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ETRI 표준화 현황 대시보드 — ${dataDate ?? '데이터 없음'}</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
       font-size: 13px; color: #1f2937; background: #f8fafc; }
/* ── Header ─────────────────────────────────── */
.site-header { background:#1e3a5f; color:white; padding:14px 24px; display:flex; align-items:center; justify-content:space-between; }
.site-header h1 { font-size:17px; font-weight:700; }
.site-header .meta { font-size:11px; opacity:.75; margin-top:2px; }
/* ── Main ───────────────────────────────────── */
.main { max-width:1600px; margin:0 auto; padding:20px 20px 40px; }
/* ── KPI cards ──────────────────────────────── */
.kpi-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:12px; margin-bottom:20px; }
.kpi-card { background:white; border-radius:10px; padding:14px 16px; box-shadow:0 1px 3px rgba(0,0,0,.08); }
.kpi-label { font-size:11px; color:#6b7280; margin-bottom:4px; }
.kpi-value { font-size:26px; font-weight:700; }
.kpi-total  { color:#1e3a5f; }
.kpi-fin    { color:#3b82f6; }
.kpi-dev    { color:#22c55e; }
.kpi-prop   { color:#eab308; }
.kpi-plan   { color:#a855f7; }
.kpi-patent { color:#ef4444; }
/* ── Chart row ──────────────────────────────── */
.chart-row { display:grid; grid-template-columns:320px 1fr 1fr; gap:16px; margin-bottom:20px; }
.chart-card { background:white; border-radius:10px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,.08); overflow:hidden; }
.chart-card h3 { font-size:12px; font-weight:600; color:#374151; margin-bottom:12px; text-transform:uppercase; letter-spacing:.05em; }
/* ── Search / filter bar ────────────────────── */
.controls { display:flex; gap:10px; align-items:center; margin-bottom:12px; }
.search-box { flex:1; max-width:360px; padding:7px 12px; border:1px solid #d1d5db; border-radius:8px; font-size:13px; outline:none; }
.search-box:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.15); }
.btn { padding:7px 14px; border:1px solid #d1d5db; border-radius:8px; background:white; font-size:12px; cursor:pointer; }
.btn:hover { background:#f3f4f6; }
.record-count { font-size:12px; color:#6b7280; margin-left:auto; }
/* ── Table ──────────────────────────────────── */
.tbl-wrap { background:white; border-radius:10px; box-shadow:0 1px 3px rgba(0,0,0,.08); overflow:auto; }
table { width:100%; border-collapse:collapse; font-size:12px; }
thead th { position:sticky; top:0; background:#f1f5f9; padding:9px 10px; text-align:left;
           font-weight:600; font-size:11px; color:#475569; white-space:nowrap;
           border-bottom:1px solid #e2e8f0; cursor:pointer; user-select:none; }
thead th:hover { background:#e2e8f0; }
thead th.sort-asc::after  { content: ' ▲'; font-size:9px; }
thead th.sort-desc::after { content: ' ▼'; font-size:9px; }
tbody tr.data-row { border-bottom:1px solid #f1f5f9; transition:background .12s; }
tbody tr.data-row:hover { background:#f8fafc; }
tbody tr.data-row td { padding:7px 10px; }
.abstract-row td { line-height:1.5; }
/* ── Status pills ───────────────────────────── */
.status-pill { display:inline-block; padding:2px 7px; border-radius:12px; font-size:10px; font-weight:600; }
.status-제정완료 { background:#dbeafe; color:#1d4ed8; }
.status-개발중   { background:#dcfce7; color:#15803d; }
.status-제안중   { background:#fef9c3; color:#854d0e; }
.status-계획중   { background:#f3e8ff; color:#6b21a8; }
.status-개발중단 { background:#f1f5f9; color:#64748b; }
/* ── Change badges ──────────────────────────── */
.badge { display:inline-block; padding:1px 5px; border-radius:4px; font-size:9px; font-weight:700;
         margin-right:4px; vertical-align:middle; }
.badge-new { background:#dcfce7; color:#15803d; }
.badge-mod { background:#fef9c3; color:#92400e; }
/* ── Footer ─────────────────────────────────── */
.footer { text-align:center; font-size:11px; color:#9ca3af; margin-top:24px; }
@media (max-width:1024px) {
  .kpi-grid { grid-template-columns:repeat(3,1fr); }
  .chart-row { grid-template-columns:1fr; }
}
@media print {
  .controls { display:none; }
  body { background:white; }
  .tbl-wrap { box-shadow:none; }
  .site-header { background:#1e3a5f !important; -webkit-print-color-adjust:exact; }
}
</style>
</head>
<body>

<!-- ── Header ─────────────────────────────────────────────────────────── -->
<div class="site-header">
  <div>
    <h1>ETRI 표준화 현황 대시보드</h1>
    <div class="meta">데이터 기준: ${esc(dataDate ?? '–')} &nbsp;|&nbsp; 내보낸 시각: ${esc(now)}</div>
  </div>
  <div style="font-size:12px;opacity:.7;">전체 ${total}건</div>
</div>

<div class="main">

  <!-- ── KPI cards ─────────────────────────────────────────────────────── -->
  <div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-label">총 표준 수</div><div class="kpi-value kpi-total">${total}</div></div>
    <div class="kpi-card"><div class="kpi-label">제정완료</div><div class="kpi-value kpi-fin">${finished}</div></div>
    <div class="kpi-card"><div class="kpi-label">개발중</div><div class="kpi-value kpi-dev">${developing}</div></div>
    <div class="kpi-card"><div class="kpi-label">제안중</div><div class="kpi-value kpi-prop">${proposed}</div></div>
    <div class="kpi-card"><div class="kpi-label">계획중</div><div class="kpi-value kpi-plan">${planning}</div></div>
    <div class="kpi-card"><div class="kpi-label">표준특허 보유</div><div class="kpi-value kpi-patent">${patents}</div></div>
  </div>

  <!-- ── Charts ────────────────────────────────────────────────────────── -->
  <div class="chart-row">
    <div class="chart-card">
      <h3>상태 분포</h3>
      <div style="overflow:visible">${statusSvg}</div>
    </div>
    <div class="chart-card">
      <h3>전략기술 분야</h3>
      ${techSvg}
    </div>
    <div class="chart-card">
      <h3>표준기구</h3>
      ${bodySvg}
    </div>
  </div>

  <!-- ── Table ─────────────────────────────────────────────────────────── -->
  <div class="controls">
    <input class="search-box" type="text" id="searchInput"
      placeholder="표준 제목, 번호, 기고자, 표준기구 검색…"
      oninput="filterTable()" />
    <select id="statusFilter" class="btn" onchange="filterTable()">
      <option value="">전체 상태</option>
      <option>제정완료</option><option>개발중</option>
      <option>제안중</option><option>계획중</option><option>개발중단</option>
    </select>
    <select id="changeFilter" class="btn" onchange="filterTable()">
      <option value="">전체 변경</option>
      <option value="new">신규</option>
      <option value="modified">수정</option>
    </select>
    <button class="btn" onclick="window.print()">🖨 인쇄</button>
    <span class="record-count" id="countLabel">${total}건</span>
  </div>

  <div class="tbl-wrap">
    <table id="mainTable">
      <thead>
        <tr>
          <th onclick="sortTable(0)">순번</th>
          <th onclick="sortTable(1)">소</th>
          <th onclick="sortTable(2)">본부(단)</th>
          <th onclick="sortTable(3)" style="min-width:200px">표준 제목</th>
          <th onclick="sortTable(4)">표준번호</th>
          <th onclick="sortTable(5)">표준기구</th>
          <th onclick="sortTable(6)">작업반</th>
          <th onclick="sortTable(7)">상태</th>
          <th onclick="sortTable(8)" style="min-width:120px">전략기술</th>
          <th onclick="sortTable(9)">시작</th>
          <th onclick="sortTable(10)">완료</th>
          <th onclick="sortTable(11)" style="min-width:100px">기고자</th>
          <th onclick="sortTable(12)">특허</th>
        </tr>
      </thead>
      <tbody id="tableBody">
        ${tableRows}
      </tbody>
    </table>
  </div>

  <div class="footer">
    ETRI 표준화 현황 대시보드 &nbsp;—&nbsp; 이 파일은 서버 없이 브라우저에서 직접 열 수 있습니다.
  </div>
</div>

<script>
const RAW = ${safeJson};

// ── Search + filter ──────────────────────────────────────────────────────────
function filterTable() {
  const q      = document.getElementById('searchInput').value.trim().toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const change = document.getElementById('changeFilter').value;
  const rows   = document.querySelectorAll('#tableBody .data-row');
  let visible  = 0;
  rows.forEach((row, i) => {
    const r = RAW[i] || {};
    const text = [r.title, r.stdNo, r.contributor, r.stdBody].join(' ').toLowerCase();
    const matchQ = !q || text.includes(q);
    const matchS = !status || r.status === status;
    const matchC = !change || r._changeType === change;
    const show   = matchQ && matchS && matchC;
    row.style.display = show ? '' : 'none';
    // hide abstract if parent hidden
    const ab = document.getElementById('ab-' + i);
    if (ab) ab.style.display = 'none';
    if (show) visible++;
  });
  document.getElementById('countLabel').textContent = visible + '건';
}

// ── Abstract toggle ──────────────────────────────────────────────────────────
function toggleAbstract(idx) {
  const ab = document.getElementById('ab-' + idx);
  if (ab) ab.style.display = ab.style.display === 'none' ? '' : 'none';
}

// ── Column sort ──────────────────────────────────────────────────────────────
let _sortCol = -1, _sortAsc = true;
function sortTable(colIdx) {
  const ths = document.querySelectorAll('#mainTable thead th');
  if (_sortCol === colIdx) { _sortAsc = !_sortAsc; }
  else { _sortCol = colIdx; _sortAsc = true; }
  ths.forEach((th, i) => { th.classList.remove('sort-asc','sort-desc'); if (i === colIdx) th.classList.add(_sortAsc ? 'sort-asc' : 'sort-desc'); });

  const tbody = document.getElementById('tableBody');
  // collect pairs of (dataRow, abstractRow)
  const pairs = [];
  const allRows = Array.from(tbody.children);
  let i = 0;
  while (i < allRows.length) {
    const dr = allRows[i++];
    if (!dr.classList.contains('data-row')) continue;
    const ab = (i < allRows.length && !allRows[i].classList.contains('data-row')) ? allRows[i++] : null;
    pairs.push([dr, ab]);
  }
  pairs.sort(([a], [b]) => {
    const ta = a.cells[colIdx]?.textContent?.trim() ?? '';
    const tb = b.cells[colIdx]?.textContent?.trim() ?? '';
    const na = parseFloat(ta), nb = parseFloat(tb);
    let cmp = (!isNaN(na) && !isNaN(nb)) ? na - nb : ta.localeCompare(tb, 'ko');
    return _sortAsc ? cmp : -cmp;
  });
  pairs.forEach(([dr, ab]) => { tbody.appendChild(dr); if (ab) tbody.appendChild(ab); });
}
</script>
</body>
</html>`
}

/**
 * triggerHtmlDownload(records, dataDate)
 * Generates the HTML and initiates a browser download.
 */
export function triggerHtmlDownload(records, dataDate) {
  const html = generateDashboardHtml(records, dataDate)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  const dateStr = (dataDate ?? 'export').replace(/[^0-9a-zA-Z가-힣-]/g, '_')
  a.href     = url
  a.download = `ETRI_표준화현황_${dateStr}.html`
  a.click()
  URL.revokeObjectURL(url)
}
