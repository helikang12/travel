import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDseUjJ18or_-f3W-8gFuzfopF0H71kVuk",
    authDomain: "travel-e3273.firebaseapp.com",
    projectId: "travel-e3273",
    storageBucket: "travel-e3273.firebasestorage.app",
    messagingSenderId: "88738310831",
    appId: "1:88738310831:web:ffbacfcc9877f62b31025a",
    datebase URL: https://travel-e3273-default-rtdb.asia-southeast1.firebasedatabase.app/
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

// 프로젝트에 제공된 Firebase 웹 앱 설정입니다.
// Firebase 웹 설정은 브라우저용 식별 정보이며, 보안은 Authentication과 Database Rules로 설정합니다.
export const firebaseConfig = {
  apiKey: 'AIzaSyDseUjJ18or_-f3W-8gFuzfopF0H71kVuk',
  authDomain: 'travel-e3273.firebaseapp.com',
  databaseURL: 'https://travel-e3273-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: 'travel-e3273',
  storageBucket: 'travel-e3273.firebasestorage.app',
  messagingSenderId: '88738310831',
  appId: '1:88738310831:web:ffbacfcc9877f62b31025a'
};

// 관리자 계정의 이메일과 Authentication UID를 Firebase 콘솔에서 확인해 입력하세요.
export const adminEmail = '';
export const adminUid = '';
