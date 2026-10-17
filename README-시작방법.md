# Codex 여행지·숙소 사이트 시작 파일

이 묶음에는 기획·개발 규칙 파일과 Firebase·배포 준비 예시가 포함되어 있습니다.

- .agents/skills/travel-site-planner/SKILL.md: 반복해서 사용할 여행 사이트 기획 작업 절차
- AGENTS.md: 이 프로젝트에서 항상 지킬 개발 규칙
- docs/PRD.md: 이번 여행지·숙소 예약 사이트가 만들 기능과 화면·테이블 설계
- js/firebase-config.example.js와 firebase/database.rules.json: 실제 프로젝트 값 입력 전 설정 예시
- firebase.json: Realtime Database 규칙 파일 경로
- docs/FIREBASE-SETUP.md와 docs/DEPLOYMENT.md: Firebase 연결, GitHub 업로드, Vercel 배포 절차

## 적용 방법

1. 이 압축파일을 새 프로젝트의 최상위 폴더에 풉니다.
2. 최상위 폴더에 AGENTS.md, .agents, html, css, js, firebase, docs 폴더가 보이는지 확인합니다. html과 css는 파일을 넣을 자리만 준비되어 있습니다. index.html과 사이트 화면 소스는 다음 개발 단계에서 작성합니다.
3. 해당 프로젝트 폴더를 연 상태로 Codex를 시작합니다.
4. Codex에게 먼저 다음과 같이 요청합니다.

   AGENTS.md와 docs/PRD.md를 읽고 메뉴, 화면, Firebase 데이터 구조와 보안 규칙 예시를 검토해줘. 아직 구현하지 말고, Firebase 연결에 필요한 설정과 단계별 개발 계획을 알려줘.

5. 기획을 확정한 뒤 다음과 같이 요청합니다.

   확정된 기획에 따라 메인 화면부터 구현해줘. index.html은 루트, 나머지 HTML은 html 폴더, CSS는 css, JavaScript는 js 폴더에 작성해줘. 기존 파일 구조를 살펴보고 모바일 화면과 주요 링크를 점검해줘.

## 무엇을 어디에 적었나요?

- 스킬에는 다른 사이트 작업에도 재사용할 수 있는 기획 진행 순서와 출력·점검 기준을 적었습니다.
- AGENTS.md에는 HTML/CSS/순수 JavaScript, 정해진 폴더 규칙, Firebase 검증, GitHub 업로드와 Vercel 배포 순서를 적었습니다.
- PRD.md에는 사이트 메뉴, 화면 파일명, Firebase 데이터 경로와 최소 필드, 관리자 대시보드, 사용자 흐름을 적었습니다.

스킬은 여행 사이트 기획을 반복할 때 쓰고, 이번 사이트의 구체적인 요구사항은 docs/PRD.md에서 관리하면 됩니다. Firebase 프로젝트를 만든 뒤 웹 설정값과 관리자 UID를 예시에 입력하고 보안 규칙을 시험해야 실제 연동을 시작할 수 있습니다.
