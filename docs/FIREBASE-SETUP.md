# Firebase 연결 준비 안내

## 1. Firebase 프로젝트 만들기

1. Firebase Console에서 새 프로젝트를 만든다.
2. 프로젝트에 웹 앱을 추가한다.
3. 프로젝트 설정에서 웹 앱의 Firebase 설정 객체를 확인한다.
4. Firebase Authentication에서 이메일/비밀번호 로그인을 활성화한다.
5. Realtime Database를 만들고 리전을 선택한다. 실제 Database URL을 기록한다.

## 2. 웹 설정값 입력

js/firebase-config.example.js를 js/firebase-config.js로 복사한 다음 Firebase 콘솔의 실제 값으로 바꾼다. databaseURL은 Realtime Database 콘솔에서 확인한 주소를 사용한다. 이메일/비밀번호 Authentication 제공업체를 활성화한다.

설정 파일에는 아래 관리자 항목도 입력한다.

```js
export const adminEmail = 'Firebase Authentication에 등록한 관리자 이메일';
export const adminUid = '해당 관리자 계정 UID';
```

관리자 로그인 화면의 아이디 `admin`은 이 관리자 이메일 계정으로 인증한다. 비밀번호는 코드에 저장하지 않고 Firebase Authentication에 입력해 검증한다. Authentication 계정의 UID가 설정값과 일치해야 관리자 대시보드에 들어갈 수 있다.

Firebase 웹 설정은 브라우저에서 Firebase 프로젝트를 식별한다. 서비스 계정 JSON, Admin SDK 비공개 키, 비밀번호를 이 파일에 복사하지 않는다.

## 3. 최초 관리자 지정

1. Firebase Authentication에서 운영자 계정을 만든다.
2. 해당 사용자의 UID를 Authentication 사용자 목록에서 확인한다.
3. firebase/database.rules.json 안의 ADMIN_UID_PLACEHOLDER를 실제 UID로 바꾼다. `js/firebase-config.js`의 `adminUid`와 동일한 UID여야 한다.
4. 규칙을 적용하기 전 일반 회원이 관리자 전용 경로를 읽거나 쓸 수 없는지 Rules Simulator 또는 Firebase Emulator에서 확인한다.

초기 예시는 관리자 한 명의 UID를 확인하는 방식이다. 운영자가 여러 명이 되면 custom claims와 신뢰할 수 있는 관리자 계정 관리 방식으로 확장한다. 회원 프로필 데이터만 바꾸어 관리자 권한을 얻을 수 없어야 한다. 회원을 suspended로 바꾸면 Database 접근은 제한되지만 Firebase Authentication 로그인 계정 자체를 비활성화하지는 않는다. 로그인을 차단해야 한다면 신뢰할 수 있는 관리자 도구에서 Authentication 계정도 별도로 정지한다.

## 4. 초기 데이터 구조

- destinations/{destinationId}: 공개 여행지 정보
- stays/{stayId}: 숙소 정보, destinationId로 여행지 연결
- members/{uid}: Firebase Authentication 사용자 프로필
- reservations/{reservationId}: 신청·확정·취소 상태가 있는 예약 정보

Database Rules는 목록 검색에 필요한 쿼리 조건을 확인한다. 공개 여행지 목록은 status가 published인 쿼리, 숙소 목록은 status가 active인 쿼리로 읽는다. 회원 예약 목록은 memberId가 로그인 사용자 UID와 같은 쿼리로 읽는다.

## 5. 예약 확인 정책

첫 버전은 예약을 requested 상태로 신청하고 관리자가 숙소의 날짜별 가능 여부와 신청 금액을 확인한 뒤 confirmed로 바꾼다. 신청 화면은 예약 확정 전임을 알린다. 실시간 객실 수량 차감, 동시 예약 방지, 자동 결제는 첫 버전에서 보장하지 않는다.

이 설정과 보안 규칙은 시작용 예시다. 프로젝트 UID와 URL을 확인하고 Firebase Rules Simulator 또는 Emulator로 읽기·쓰기 권한을 확인한 뒤 적용한다. 기본 차단 규칙을 유지하고 규칙 오류로 전체 데이터가 공개되지 않게 한다.

## 6. 현재 구현 범위

- 회원가입은 Firebase Authentication 계정을 만들고 성공하면 `/members/{uid}`에 프로필을 기록한다. 비밀번호는 Realtime Database에 저장하지 않는다.
- 여행지와 숙소를 숨김·비활성화할 때 데이터와 예약 이력을 지우지 않는다.
- 관리자 대시보드는 여행지·숙소 관리, 예약 상태 확인, 회원 정보 조회를 제공한다.
- 새 예약의 가격 검증·객실 재고·실제 예약 접수는 신뢰할 서버/API가 추가되기 전까지 활성화하지 않는다. 브라우저가 보낸 금액을 검증 없이 확정하지 않는다.
- 제공된 Firebase 웹 앱 설정을 `js/firebase-config.js`에 입력해 두었다. Authentication 제공업체 활성화 상태와 관리자 이메일·UID는 확인되지 않았고 Emulator도 연결되지 않아 실제 인증, 데이터 저장, Rules 권한 시험은 아직 수행하지 못했다. 비로그인·회원·관리자 권한으로 Rules Simulator 또는 Emulator 시험을 완료한다.
