# ETRI 표준화 현황 대시보드

ETRI(한국전자통신연구원)의 표준화 활동 현황을 Excel 파일로부터 로드하여 시각화하는 클라이언트 전용 대시보드입니다.
서버 없이 브라우저에서 완전히 동작하며, 데이터는 IndexedDB에 로컬 저장됩니다.

---

## 주요 기능

| 분류 | 기능 |
|------|------|
| **데이터 관리** | Excel(.xlsx) 업로드, 유효성 검사, 변경사항 Diff 미리보기, 버전 이력 관리 (최대 5개), 버전 복원 |
| **홈 대시보드** | KPI 카드 6종, 상태 파이차트, 전략기술 누적 바차트, 표준기구 현황, 연도별 추이, 기고자 분포 |
| **전략기술 탭** | 4분면 포지셔닝 매트릭스 (건수 × 완료율), 상태 분포 바차트, 상세 테이블 |
| **표준기구 탭** | 기구 → 작업반(WG/SG) 2단계 드릴다운 |
| **부서 탭** | 직할부서 → 세부부서 2단계 드릴다운 |
| **연도별 탭** | 제정완료 누적 추이, 완료연도별 상태 분포, 착수 연도별 현황 |
| **표준특허 탭** | 특허 보유/상태/출원국가/전략기술별 분포, 상세 목록 |
| **공통** | 전역 필터(전략기술·기구·부서·상태·이번갱신), 글로벌 검색, Excel 내보내기, URL 상태 공유, 사이드 패널 드릴다운 |

---

## 기술 스택

| 역할 | 라이브러리 |
|------|-----------|
| UI 프레임워크 | React 19 + Vite 8 |
| 스타일링 | Tailwind CSS v4 |
| 상태 관리 | Zustand v5 |
| 차트 | Recharts v3 |
| Excel 파싱/내보내기 | SheetJS (xlsx 0.18) |
| 로컬 스토리지 | idb-keyval (IndexedDB) |

---

## 요구사항

- **Node.js** 18 이상
- **npm** 9 이상

---

## 설치 및 실행

### 1. 저장소 클론

```bash
git clone https://github.com/Suwook-HA/etri-standards-dashboard.git
cd etri-standards-dashboard
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 4. 프로덕션 빌드

```bash
npm run build       # dist/ 폴더에 빌드 결과물 생성
npm run preview     # 빌드 결과물 로컬 미리보기 (port 4173)
```

---

## 사용 방법

### 첫 실행 — 데이터 업로드

1. 앱 실행 시 **업로드 화면**이 표시됩니다.
2. `표준화 선도전략/Input/` 폴더의 Excel 파일(`.xlsx`)을 드래그&드롭하거나 클릭하여 선택합니다.
3. 유효성 검사 통과 후 **변경사항 미리보기**를 확인합니다.
4. **이 내용으로 적용하기** 버튼을 클릭하면 대시보드가 활성화됩니다.

### Excel 파일 형식

- 시트명: `취합`
- 필수 컬럼: `소`, `본부(단)`, `표준 제목 (예정)`, `표준번호`, `표준기구`, `표준화 상태`, `전략기술 분야`, `변경여부` 등

### 데이터 갱신

- 헤더 우측 **데이터 관리** 버튼 클릭 → 새 Excel 파일 업로드
- 이전 버전 대비 신규/수정/삭제 항목을 Diff로 확인 후 적용
- **버전 이력** 버튼에서 최근 5개 버전 확인 및 이전 버전 복원 가능

### URL 공유

필터와 탭 상태가 URL에 자동 반영됩니다. 주소창을 복사하여 공유하면 동일한 뷰를 재현할 수 있습니다.

```
http://localhost:5173?tab=tech&body=ITU-T&status=개발중
```

---

## 프로젝트 구조

```
src/
├── components/
│   ├── dashboard/       # 홈, 전략기술, 표준기구, 부서, 연도별, 표준특허 뷰
│   ├── layout/          # Header, NavBar, FilterBar, SidePanel, VersionHistory
│   ├── panel/           # StandardList, StandardDetail (사이드 패널)
│   └── upload/          # UploadPage, ValidationPage, DiffPage
├── hooks/
│   └── useUrlSync.js    # URL ↔ 상태 동기화
├── store/
│   └── useStore.js      # Zustand 전역 상태
└── utils/
    ├── constants.js     # 컬럼 매핑, 색상, 상수
    ├── diff.js          # 버전 간 레코드 비교
    ├── exportExcel.js   # Excel 내보내기
    ├── validation.js    # 업로드 데이터 유효성 검사
    ├── versionStorage.js # IndexedDB 버전 관리
    └── xlsxParser.js    # Excel 파싱 및 레코드 정규화
```

---

## 데이터 저장 방식

모든 데이터는 브라우저의 **IndexedDB**에 저장됩니다. 서버 전송 없이 로컬에서만 처리되며, 최대 5개 버전을 유지합니다.

- `version_data_N` — 전체 레코드 배열
- `version_meta_N` — 날짜, 메모, 파일명, 레코드 수
- `changeset_N` — 해당 버전의 신규/수정/삭제 변경셋
- `__config__` — 활성 버전 번호 및 버전 목록

---

## 라이선스

내부 업무용 도구입니다.
