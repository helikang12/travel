// 이 파일을 js/firebase-config.js로 복사하고 Firebase 콘솔의 웹 앱 값으로 바꾸세요.
// 관리자 로그인 아이디는 admin이며, adminEmail 계정의 UID가 adminUid와 일치해야 합니다.
// 서비스 계정 키나 비밀번호는 이 파일에 넣지 마세요.
export const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_WEB_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  databaseURL: 'https://YOUR_PROJECT_ID-default-rtdb.REGION.firebasedatabase.app',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID'
};
export const adminEmail = 'YOUR_ADMIN_EMAIL';
export const adminUid = 'YOUR_ADMIN_AUTH_UID';
