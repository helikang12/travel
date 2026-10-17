import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-database.js';

let services;
let setupError;

try {
  const configModule = await import('./firebase-config.js');
  const { firebaseConfig, adminEmail, adminUid } = configModule;
  const hasConfig = firebaseConfig && Object.values(firebaseConfig).every((value) => typeof value === 'string' && value && !value.includes('YOUR_'));
  if (!hasConfig) throw new Error('Firebase 웹 설정값이 비어 있습니다. js/firebase-config.js를 확인해 주세요.');
  const app = initializeApp(firebaseConfig);
  services = {
    app,
    auth: getAuth(app),
    database: getDatabase(app),
    adminEmail: adminEmail && !adminEmail.includes('YOUR_') ? adminEmail : '',
    adminUid: adminUid && !adminUid.includes('YOUR_') ? adminUid : ''
  };
} catch (error) {
  setupError = error;
}

export function getServices() {
  if (!services) throw new Error(setupError?.message || 'Firebase 설정을 불러오지 못했습니다.');
  return services;
}

export function getSetupError() {
  return setupError;
}
