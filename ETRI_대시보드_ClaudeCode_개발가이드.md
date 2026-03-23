# ETRI 표준화 대시보드 — Claude Code 개발 시작 가이드

**작성일**: 2025년 3월  
**연계 문서**: ETRI_표준화_대시보드_기능요구사항정의서_v2.md

---

## 1단계 — 환경 준비

터미널에서 Claude Code를 실행하고, 프로젝트 폴더를 만든 뒤 시작합니다.

```bash
# 프로젝트 폴더 생성
mkdir etri-standards-dashboard
cd etri-standards-dashboard

# Claude Code 실행
claude
```

---

## 2단계 — 첫 프롬프트로 프로젝트 초기화

Claude Code 안에서 아래 내용을 그대로 붙여넣어 초기 세팅을 시킵니다.

```
다음 조건으로 React + Vite 프로젝트를 초기화해줘.

프로젝트명: etri-standards-dashboard
기술 스택:
- React 18
- Vite
- Tailwind CSS
- Zustand (상태관리)
- SheetJS (xlsx 파싱)
- Recharts (차트)
- idb-keyval (IndexedDB 버전 저장)

폴더 구조:
src/
  components/      # 공통 UI 컴포넌트
  views/           # 5개 뷰 (Home, TechArea, StdBody, Yearly, Patent)
  features/
    data-manager/  # 엑셀 업로드·diff·버전 관리
    filters/       # 전역 필터
    panel/         # 사이드 패널 (목록·상세)
  store/           # Zustand 스토어
  utils/           # 파싱·diff 계산 유틸
  types/           # TypeScript 타입 정의
data/
  sample.xlsx      # 초기 샘플 데이터

패키지 설치까지 완료해줘.
```

---

## 3단계 — CLAUDE.md 작성 (가장 중요)

프로젝트 루트에 `CLAUDE.md` 파일을 만듭니다.  
이 파일은 Claude Code가 매 작업마다 참고하는 프로젝트 가이드입니다.  
아래 내용을 그대로 붙여넣어 파일을 생성하세요.

````markdown
# ETRI 표준화 현황 대시보드 — CLAUDE.md

## 프로젝트 개요
ETRI 표준연구본부의 연간 표준화 전수조사 결과(Excel)를
인터랙티브 대시보드로 제공하는 웹앱.

## 핵심 설계 원칙
- 모든 차트·테이블의 수치는 클릭 시 우측 사이드 패널에
  필터링된 표준 목록을 즉시 표시해야 한다 (드릴다운 원칙)
- 전역 필터 변경은 열려 있는 패널 포함 모든 뷰에 즉시 반영된다
- 데이터는 담당자가 Excel 업로드 → Diff 확인 → 적용 순서로 갱신한다

## 데이터 식별 키
레코드 동일성 판별 = 표준기구(stdBody) + 표준번호(stdNo) 복합키
공백인 경우 표준 제목(title)을 보조 키로 사용

## Excel 컬럼 → 필드명 매핑
소              → institute
본부(단)        → department
표준 제목       → title
표준번호        → stdNo        ← 식별 키 (1)
표준기구        → stdBody      ← 식별 키 (2)
위원회, 작업반  → workingGroup
표준화 상태     → status       (제정완료|개발중|제안중|계획중|개발중단)
표준 주요 내용  → abstract
(예정) 시작년도 → startYear
(예정) 완료연도 → endYear
ETRI 기고자     → contributor
ETRI 에디터     → editor
ETRI 의장단     → chairPosition
사업분류        → projectType
출연처          → fundingAgency
전략기술 분야   → techArea
세부중점기술 분야 → subTechArea
표준특허 유무   → hasPatent    (유|무|계획)
표준특허 개수   → patentCount
특허상태        → patentStatus
변경여부        → changeTypeRaw (N=신규|R=갱신)

## 시스템 생성 필드 (파싱 후 추가)
_recordKey     = stdBody + ":" + stdNo
_changeType    = new | modified | removed | unchanged
_changedFields = { field: { prev, next } }[]
_versionAdded  = 버전 번호
_lastModified  = 버전 번호

## 버전 관리 (IndexedDB)
- 최대 5개 스냅샷 보관
- 복원 시 현재 버전 자동 스냅샷 후 교체
- 저장 키: "versions", "activeVersion", "config"

## 유효성 검사 규칙 (업로드 시)
오류(적용 불가):
  - 필수 컬럼 21개 미존재
  - 행이 0건
경고(확인 후 진행):
  - status 값이 5개 허용값 외
  - endYear 숫자 아닌 값
  - techArea 신규 분류명 발견

## 표준화 전략 계산 수식 (2.3.1)
역량값(Capacity) = R × F
  R = (1/100) × (ln(1+0.1C') + ln(1+0.6E') + ln(1+0.3G'))
  F = 1 - e^(-0.3 × S)
  C=의장단수, E=에디터수, G=기고자수, S=표준건수합계, ε=0.001

단계값(StageValue) = N / T̃
  N = 0.3×P_plan + 0.5×P_prop + 1.0×P_dev + 2.0×P_rec
  T̃ = 총건수 + ε

## FRQ 우선순위
Phase 1 (필수): FRQ-001,002,010,012,017,019~026
Phase 2 (권고): FRQ-003~006,008,015,016,018,023,027~029,031
Phase 3 (선택): FRQ-007,009,011,013,014,030

## 금지 사항
- 수식 계산값을 하드코딩하지 말 것 (동적 계산 필수)
- 연도 기준을 2025로 하드코딩하지 말 것 (new Date().getFullYear() 사용)
- 차트 클릭 이벤트 없이 시각화만 구현하지 말 것
````

---

## 4단계 — Phase 1 작업을 순서대로 지시

초기화가 완료되면 아래 순서로 하나씩 요청합니다.  
한 번에 하나씩 완료를 확인한 뒤 다음으로 넘어가는 게 안전합니다.

### 4-1. 타입 정의 먼저

```
CLAUDE.md의 필드 매핑과 시스템 생성 필드를 기반으로
src/types/index.ts 에 모든 TypeScript 타입을 정의해줘.
StandardRecord, VersionSnapshot, Changeset, UpdateMeta,
FilterState, PanelState 타입을 포함해야 해.
```

### 4-2. Excel 파싱 유틸

```
src/utils/parseExcel.ts 를 작성해줘.
SheetJS로 .xlsx 파일을 파싱하고 StandardRecord[] 로 변환,
_recordKey 생성, 유효성 검사(오류/경고 분류)까지 포함해줘.
CLAUDE.md의 컬럼 매핑과 유효성 규칙을 그대로 따를 것.
```

### 4-3. Diff 계산 유틸

```
src/utils/diffRecords.ts 를 작성해줘.
이전 버전과 새 버전의 StandardRecord[]를 받아
_recordKey 기준으로 new/modified/removed/unchanged를 분류하고
수정된 경우 _changedFields에 이전값·신규값을 기록해줘.
```

### 4-4. Zustand 스토어

```
src/store/ 에 다음 스토어를 작성해줘.
- dataStore.ts: 활성 데이터, 버전 목록, 활성 버전 번호, IndexedDB 연동
- filterStore.ts: 전역 필터 상태 (techArea, status, stdBody, institute,
  yearRange, fundingAgency, isThisUpdateOnly)
- panelStore.ts: 사이드 패널 상태 (isOpen, mode: 'list'|'detail',
  context, history stack)
```

### 4-5. 업로드·Diff UI

```
src/features/data-manager/ 에 다음 컴포넌트를 작성해줘.
- UploadDropzone.tsx: 드래그 앤 드롭 + 파일 선택, 메모 입력
- ValidationResult.tsx: 오류/경고 결과 표시, 경고 인지 확인 버튼
- DiffPreview.tsx: 탭 필터(신규/수정/삭제/변경없음) + 테이블,
  수정 행 클릭 시 필드별 이전값→신규값 인라인 확장
- VersionHistory.tsx: 버전 목록, 복원·비교 버튼
```

### 4-6. KPI 카드 + 사이드 패널

```
src/components/ 에 다음을 작성해줘.
- KpiCard.tsx: 레이블, 수치, 클릭 시 panelStore에 컨텍스트 전달
- SidePanel.tsx: 우측 슬라이드인 패널, list/detail 모드 전환, 뒤로가기 스택
- StandardList.tsx: 목록 테이블 (정렬, 페이지네이션 20건, 컨텍스트 헤더)
- StandardDetail.tsx: 상세 정보, 연관 탐색 버튼
filterStore의 필터 변경 시 패널 내용도 자동 갱신되어야 해.
```

### 4-7. 홈 대시보드

```
src/views/Home.tsx 를 작성해줘.
KPI 카드 6종, 상태별 파이차트, 전략기술별 누적 막대차트,
연도별 라인차트, 표준기구 도넛차트를 배치해줘.
모든 차트 클릭 이벤트는 panelStore를 통해 사이드 패널을 열어야 해.
갱신 현황 위젯도 포함해줘 (FRQ-031).
```

---

## 5단계 — 샘플 데이터로 동작 확인

```
data/sample.xlsx 로 현재 업로드된 실제 파일을 복사해두고
앱을 실행해서 다음을 확인해줘:
1. 업로드 → 유효성 검사 → Diff 미리보기 → 적용
2. KPI 카드 클릭 → 사이드 패널 오픈
3. 전역 필터 변경 → 패널 내용 즉시 갱신
문제가 있으면 고쳐줘.
```

---

## 참고 팁

**파일 컨텍스트 지정** — 파일이 여러 개 얽혀 있을 때는 `@파일명`으로 직접 지정하면 혼선을 줄일 수 있습니다.

```
@src/utils/diffRecords.ts 를 참고해서
@src/features/data-manager/DiffPreview.tsx 를 수정해줘.
```

**되돌리기** — 작업이 예상치 못한 방향으로 가고 있다면 `/undo`로 직전 변경을 되돌릴 수 있습니다.

**작업 단위 쪼개기** — 복잡한 기능을 한 번에 요청하기보다, 기능 단위로 쪼개서 각각 완료를 확인한 뒤 다음 단계로 넘어가는 방식이 훨씬 안정적으로 동작합니다. CLAUDE.md에 핵심 원칙이 잘 정리되어 있으므로, Claude Code는 매 작업마다 이를 참고해서 일관성을 유지합니다.
