/**
 * ETRI 12대 전략기술 및 42대 중점기술 분야 정적 데이터
 * 출처: ETRI 표준체계 및 선도전략 2025 보고서 (R2.5)
 *
 * strategy: 선점 | 선도 | 추격 | 확산 | null (활동없음)
 * activity: 활동 비중 (0~5, ★ 개수)
 * subjects: 주요 표준화 대상 키워드
 */

export const STRATEGY_LABELS = {
  선점: { color: '#8b5cf6', bg: 'bg-violet-100 text-violet-700', desc: '역량 높음 + 신규 표준 제안으로 선점 가능' },
  선도: { color: '#3b82f6', bg: 'bg-blue-100 text-blue-700',   desc: '주도적 기고를 통해 표준 선도 가능' },
  추격: { color: '#f59e0b', bg: 'bg-amber-100 text-amber-700', desc: '후발주자로 추격 또는 다각화 협력 필요' },
  확산: { color: '#10b981', bg: 'bg-emerald-100 text-emerald-700', desc: '완료 단계, 후속 표준화 및 시장 확산 필요' },
}

/** 12대 전략기술 → 세부중점기술 매핑 + 메타데이터 */
export const TECH_STRATEGY_MAP = {
  '01) 반도체·디스플레이': {
    subs: [
      { id: 1,  name: '고성능·저전력 AI 반도체',           strategy: null,   activity: 0, subjects: [] },
      { id: 2,  name: '반도체 첨단 패키징',                strategy: null,   activity: 0, subjects: [] },
      { id: 3,  name: '고집적·저전력기반 메모리',           strategy: null,   activity: 0, subjects: [] },
      { id: 4,  name: '차세대 고성능 센서',                strategy: '추격', activity: 1, subjects: ['유연/신축 센서 평가방법', 'IoT 센서 성능시험', '근진동 센서 측정'] },
      { id: 5,  name: '전력반도체',                        strategy: null,   activity: 0, subjects: [] },
      { id: 6,  name: '무기발광 디스플레이',                strategy: null,   activity: 0, subjects: [] },
      { id: 7,  name: '반도체·디스플레이 소재·부품·장비',    strategy: '선도', activity: 2, subjects: ['웨어러블 소재 시험', 'OLED 성능평가', '전기변색 필름 특성측정', '메타버스용 광원소자 평가'] },
      { id: 8,  name: '프리폼 디스플레이',                  strategy: '추격', activity: 1, subjects: ['전자종이 환경시험', '터치 디스플레이 성능측정'] },
    ],
  },
  '02) 이차전지': {
    subs: [
      { id: 9,  name: '차세대 이차전지 소재·셀', strategy: null,   activity: 0, subjects: [] },
      { id: 10, name: '이차전지 모듈·시스템',     strategy: '선점', activity: 1, subjects: ['ESS 극한환경 관리', '리튬배터리 UPS 안전관리', '전기설비 관리시스템', 'ESS 성능평가'] },
    ],
  },
  '03) 첨단모빌리티': {
    subs: [
      { id: 11, name: '자율주행시스템',        strategy: '선도', activity: 3, subjects: ['차량정보서비스 인터페이스', '실내 내비게이션 시스템', '자율주행차 기능 인터페이스', '포인트클라우드 압축', '소프트웨어 정의차량'] },
      { id: 12, name: '도심항공교통(UAM)',      strategy: '추격', activity: 2, subjects: ['자율 모바일 IoT 장치 카메라 센싱', '3차원 모델 기반 모니터링', 'IoT 데이터 처리 관리', 'eVTOL 보안 가이드라인'] },
    ],
  },
  '04) 첨단바이오': {
    subs: [
      { id: 13, name: '디지털헬스 데이터 분석·활용', strategy: '선도', activity: 1, subjects: ['개인건강기록 접근권한', '산업보건 서비스 플랫폼', '자가진단 문진시스템', '웨어러블 헬스케어 성능측정', '의료영상 기반 3D 프린팅'] },
    ],
  },
  '05) 사이버보안': {
    subs: [
      { id: 14, name: '네트워크 클라우드 보안',   strategy: '선도', activity: 2, subjects: ['SDN 보안서비스', 'SFC 보안 프레임워크', 'I2NSF 보안관리 자동화', '클라우드 보안 서비스', '네트워크 스토리지 보안'] },
      { id: 15, name: '데이터 및 AI보안',         strategy: '선도', activity: 3, subjects: ['블록체인 데이터 교환', '동적 악성코드 분석', '스토리지 보안 프레임워크', 'IoT 위임서비스', '제로지식 머신러닝', 'AI 보안 벤치마크'] },
      { id: 16, name: '디지털 취약점 분석대응',    strategy: '선도', activity: 3, subjects: ['사이버보안 사고증거 수집', '표적형 이메일 공격 탐지', '능동적 네트워크 공격 대응', '침입탐지 및 방지 시스템'] },
      { id: 17, name: '신산업·가상융합 보안',      strategy: '선도', activity: 3, subjects: ['V2X 통신 보안', '커넥티드 차량 보안위협 분석', '스마트시티 디지털트윈 보안', '영상관리시스템 보안', '메타버스 보안'] },
    ],
  },
  '06) 인공지능': {
    subs: [
      { id: 18, name: '효율적학습/AI인프라고도화', strategy: '선도', activity: 2, subjects: ['클라우드 MLaaS', 'AI 표준화 로드맵', '빅데이터 참조구조', '데이터 프로파일링', '데이터 거버넌스 프레임워크', '연합학습 시스템'] },
      { id: 19, name: '첨단 AI모델링·의사결정',   strategy: '선도', activity: 2, subjects: ['지능형 에지컴퓨팅 마이크로서비스', '실내 대화형 로봇', '언어학습 대화처리', '공공의사결정 프레임워크', '다중모달 대화 시스템'] },
      { id: 20, name: '산업 활용·혁신 AI',        strategy: null,   activity: 0, subjects: [] },
      { id: 21, name: '안전·신뢰 AI',             strategy: '선도', activity: 1, subjects: ['AI 시스템 테스팅', 'ML 의료기기 성능평가', '데이터 품질 평가', 'AI 안전성 벤치마크', 'AI 위험성 평가'] },
      { id: 22, name: '휴먼증강',                  strategy: null,   activity: 0, subjects: [] },
    ],
  },
  '07) 차세대통신': {
    subs: [
      { id: 23, name: '5G 고도화',              strategy: '선도', activity: 4, subjects: ['5G 시스템 구조 및 절차', '네트워크 데이터 분석', '경량 지능형 소프트웨어', 'RoF 시스템', '연합학습 기여도 평가', '5G 에너지 효율 향상'] },
      { id: 24, name: '5G·6G 고효율 통신부품',   strategy: null,   activity: 0, subjects: [] },
      { id: 25, name: '5G·6G 위성통신',          strategy: '선도', activity: 2, subjects: ['NTN 물리계층 절차', '위성 모빌리티 관리', '위성 주파수 분배', '위성시스템 보호 방안', '위성통신 서비스 요구사항'] },
      { id: 26, name: '6G',                     strategy: '선점', activity: 2, subjects: ['IMT-2030 프레임워크', '시간확정형 네트워킹', '100GHz 이상 IMT 기술', '전파특성 모델링', '차세대 물리계층 기술'] },
      { id: 27, name: '오픈랜',                  strategy: '추격', activity: 1, subjects: ['O-RAN A1/E2 인터페이스', 'RIC 성능평가', 'CUS/M-Plane 규격', '빔관리 E2 인터페이스'] },
    ],
  },
  '08) 첨단로봇제조': {
    subs: [
      { id: 28, name: '고난도 자율조작',          strategy: '추격', activity: 1, subjects: ['클라우드 RaaS', 'RaaS 관리 프레임워크', '로봇 상호작용 서비스', '로봇 서비스 온톨로지'] },
      { id: 29, name: '로봇 자율이동',            strategy: '선도', activity: 2, subjects: ['로봇 지도 데이터', '자율배달로봇 연동', '배달로봇 참조구조', '이동로봇 서비스 유스케이스'] },
      { id: 30, name: '인간·로봇 상호작용',        strategy: '추격', activity: 1, subjects: [] },
      { id: 31, name: '가상제조',                 strategy: '선도', activity: 3, subjects: ['디지털 트윈 제조 프레임워크', '제조 디지털 스레드', '장비 행동 카탈로그', '스마트팩토리 성숙도 모델', '3D 프린팅 모델링'] },
    ],
  },
  '09) 양자': {
    subs: [
      { id: 32, name: '양자센싱',   strategy: null,   activity: 0, subjects: [] },
      { id: 33, name: '양자컴퓨팅', strategy: null,   activity: 0, subjects: [] },
      { id: 34, name: '양자통신',   strategy: '선도', activity: 2, subjects: ['QKDN 키 관리 인터페이스', 'QKDN 관리 프로토콜', 'QKDN 서비스 품질 보장', 'QKD-TLS 통합', 'QKDN 서비스 템플릿'] },
    ],
  },
  '10) 메타버스': {
    subs: [
      { id: 35, name: '초실감 입체 미디어 기술', strategy: '선도', activity: 3, subjects: ['VVC/Post-VVC 비디오 코딩', 'MPEG-H 3D 오디오', '홀로그래픽 디스플레이 측정', '포인트클라우드 압축', '이머시브 비디오', '뉴럴 공간 표현', '디지털 휴먼 품질평가'] },
      { id: 36, name: '초실감 상호작용 기술',   strategy: '선도', activity: 2, subjects: ['제스처 인터페이스', '몸 움직임 정의', 'VR 멀미 저감', '후각 검사 프레임워크', '디지털 휴먼 인터페이스', 'SDF 확장', '메타버스 플랫폼 상호운용성'] },
    ],
  },
  '11) 초성능컴퓨팅': {
    subs: [
      { id: 37, name: '슈퍼컴퓨팅',       strategy: '선도', activity: 2, subjects: ['클라우드 컴퓨팅 상호운용성', '클라우드 프레임워크', '분산 클라우드 관리', '멀티 클라우드 관리', '데이터 스토리지 페더레이션'] },
      { id: 38, name: 'AI컴퓨팅 시스템',   strategy: '추격', activity: 3, subjects: ['에지 컴퓨팅 요구사항', '컨테이너 관리', '가상머신 통합관리', 'MLaaS 수명주기 관리', 'GPU 서비스', '온디바이스 AIoT 프레임워크'] },
    ],
  },
  '12) ICT융합': {
    subs: [
      { id: 39, name: '국방ICT융합',     strategy: null,   activity: 0, subjects: [] },
      { id: 40, name: '안전ICT융합',     strategy: '선도', activity: 3, subjects: ['차량 긴급구난체계', '소방인프라 관리', '건물 인프라 식별', '감염병 격리상태 모니터링', '판데믹 대응', '고출력 전자파 보호'] },
      { id: 41, name: '에너지ICT융합',   strategy: '추격', activity: 3, subjects: ['공장 에너지 관리', 'ICT 환경영향 평가', '그린 데이터센터', '전력 데이터 공유', '무선전력전송 서비스'] },
      { id: 42, name: '산업ICT융합',     strategy: '선도', activity: 5, subjects: ['태그기반 식별 서비스', '스마트 온실/축산 서비스', 'IoT 기반 승강기 모니터링', '디지털 트윈 연합', '스마트 농업 데이터 관리', '메타버스 IoT 연동'] },
    ],
  },
}

/**
 * techArea 이름에서 번호 접두사를 유연하게 매칭하기 위한 헬퍼.
 * Excel 데이터의 techArea 값이 "01) 반도체·디스플레이" 또는 "반도체·디스플레이" 등
 * 다양한 형태일 수 있으므로 키워드 매칭으로 찾는다.
 */
export function findTechGroup(techAreaName) {
  if (!techAreaName) return null
  // 정확한 키 매칭
  if (TECH_STRATEGY_MAP[techAreaName]) return TECH_STRATEGY_MAP[techAreaName]
  // 번호 접두사 제거 후 키워드 매칭
  const clean = techAreaName.replace(/^\d+\)\s*/, '').trim()
  for (const [key, val] of Object.entries(TECH_STRATEGY_MAP)) {
    const keyClean = key.replace(/^\d+\)\s*/, '').trim()
    if (keyClean === clean || key.includes(clean) || clean.includes(keyClean)) {
      return val
    }
  }
  return null
}
