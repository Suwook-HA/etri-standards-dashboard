export const REQUIRED_COLUMNS = [
  '소', '본부(단)', '순번', ' 표준 제목 (예정)', '표준번호', '표준기구',
  '위원회, 작업반 등', '표준화 상태', '표준 주요 내용',
  '(예정) 시작년도  ', '(예정) 완료연도', 'ETRI 기고자',
  'ETRI 에디터(예정포함)', 'ETRI 의장단', '사업분류', '출연처',
  '전략기술 분야', '세부중점기술 분야', '표준특허 유무', '표준특허 개수',
  '특허상태(출원/등록)', 'ETRI 관리번호', '표준특허명', '출원국가', '1발명자', '변경여부',
]

export const VALID_STATUSES = ['제정완료', '개발중', '제안중', '계획중', '개발중단']

export const TECH_AREAS = [
  '1) 반도체·디스플레이', '2) 이차전지', '3) 첨단모빌리티', '4) 첨단바이오',
  '5) 사이버보안', '6) 인공지능', '7) 차세대통신', '8) 첨단로봇제조',
  '9) 양자', '10) 메타버스', '11) 초성능컴퓨팅', '12) ICT융합',
]

export const INSTITUTES = [
  '인공지능컴퓨팅연구소', '초지능창의연구소', '입체통신연구소',
  '초실감메타버스연구소', '디지털융합연구소', 'ICT전략연구소', 'AI안전연구소',
]

export const STATUS_COLORS = {
  '제정완료': 'bg-blue-100 text-blue-800',
  '개발중':   'bg-green-100 text-green-800',
  '제안중':   'bg-yellow-100 text-yellow-800',
  '계획중':   'bg-purple-100 text-purple-800',
  '개발중단': 'bg-gray-100 text-gray-600',
}

export const STATUS_CHART_COLORS = {
  '제정완료': '#3b82f6',
  '개발중':   '#22c55e',
  '제안중':   '#eab308',
  '계획중':   '#a855f7',
  '개발중단': '#9ca3af',
}

export const CHANGE_TYPE_COLORS = {
  new:       'bg-green-50 border-l-4 border-green-500',
  modified:  'bg-yellow-50 border-l-4 border-yellow-500',
  removed:   'bg-red-50 border-l-4 border-red-500',
  unchanged: '',
}

export const COL = {
  institute:     '소',
  department:    '본부(단)',
  seq:           '순번',
  title:         ' 표준 제목 (예정)',
  stdNo:         '표준번호',
  stdBody:       '표준기구',
  workingGroup:  '위원회, 작업반 등',
  status:        '표준화 상태',
  abstract:      '표준 주요 내용',
  startYear:     '(예정) 시작년도  ',
  endYear:       '(예정) 완료연도',
  contributor:   'ETRI 기고자',
  editor:        'ETRI 에디터(예정포함)',
  chairPosition: 'ETRI 의장단',
  projectType:   '사업분류',
  fundingAgency: '출연처',
  techArea:      '전략기술 분야',
  subTechArea:   '세부중점기술 분야',
  hasPatent:     '표준특허 유무',
  patentCount:   '표준특허 개수',
  patentStatus:  '특허상태(출원/등록)',
  mgmtNo:        'ETRI 관리번호',
  patentName:    '표준특허명',
  patentCountry: '출원국가',
  inventor:      '1발명자',
  changeTypeRaw: '변경여부',
}
