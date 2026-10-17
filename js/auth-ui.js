import { getServices, getSetupError } from './firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';

const guestElements = document.querySelectorAll('[data-auth-signup], [data-auth-login], [data-auth-admin]');
const logoutButton = document.querySelector('[data-auth-logout]');
const reservationLink = document.querySelector('[data-reservation-link]');
const actions = document.querySelector('[data-auth-actions]');

if (getSetupError()) {
  actions?.setAttribute('data-firebase-status', '설정 필요');
} else {
  const { auth, adminUid } = getServices();
  onAuthStateChanged(auth, (user) => {
    const adminSession = Boolean(user && adminUid && user.uid === adminUid && sessionStorage.getItem('slowtrip-admin') === user.uid);
    guestElements.forEach((element) => {
      const shouldHide = adminSession || (Boolean(user) && !element.hasAttribute('data-auth-signup'));
      element.hidden = shouldHide;
    });
    if (logoutButton) {
      logoutButton.hidden = !user || adminSession;
      logoutButton.textContent = '로그아웃';
    }
    if (reservationLink) reservationLink.hidden = adminSession;
    let adminLogout = actions?.querySelector('[data-admin-logout]');
    if (adminSession && actions && !adminLogout) {
      adminLogout = document.createElement('button');
      adminLogout.type = 'button';
      adminLogout.className = 'header-logout';
      adminLogout.dataset.adminLogout = '';
      adminLogout.textContent = '관리자로그아웃';
      actions.append(adminLogout);
      adminLogout.addEventListener('click', async () => {
        await signOut(auth);
        sessionStorage.removeItem('slowtrip-admin');
        alert('관리자 로그아웃되었습니다.');
        location.reload();
      });
    }
    if (adminLogout) adminLogout.hidden = !adminSession;
  });

  logoutButton?.addEventListener('click', async () => {
    try {
      await signOut(auth);
      alert('로그아웃되었습니다');
      location.reload();
    } catch {
      alert('로그아웃 처리에 실패했습니다. 다시 시도해 주세요.');
    }
  });
}

reservationLink?.addEventListener('click', (event) => {
  if (getSetupError()) {
    event.preventDefault();
    alert('로그인후 예약하시오');
    return;
  }
  if (!getServices().auth.currentUser) {
    event.preventDefault();
    alert('로그인후 예약하시오');
  }
});
