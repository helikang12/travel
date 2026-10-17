import { getServices, getSetupError } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';
import { ref, set, get } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-database.js';

const signupForm = document.querySelector('#signup-form');
const loginForm = document.querySelector('#login-form');
const adminForm = document.querySelector('#admin-login-form');

function showStatus(form, message, isError = false) {
  const status = form.querySelector('.form-status');
  if (status) {
    status.textContent = message;
    status.classList.toggle('is-error', isError);
  }
}

function friendlyError(error) {
  const messages = {
    'auth/email-already-in-use': '이미 가입된 이메일입니다.',
    'auth/invalid-email': '이메일 주소를 확인해 주세요.',
    'auth/weak-password': '비밀번호는 6자 이상 입력해 주세요.',
    'auth/invalid-credential': '이메일 또는 비밀번호를 확인해 주세요.',
    'auth/user-disabled': '사용이 중지된 계정입니다.',
    'auth/network-request-failed': '네트워크 연결을 확인해 주세요.'
  };
  return messages[error?.code] || error?.message || '요청을 처리하지 못했습니다.';
}

if (signupForm) {
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = signupForm.querySelector('button[type="submit"]');
    button.disabled = true;
    let createdUser;
    try {
      const { auth, database } = getServices();
      const values = Object.fromEntries(new FormData(signupForm));
      const credential = await createUserWithEmailAndPassword(auth, values.email.trim(), values.password);
      createdUser = credential.user;
      await set(ref(database, `members/${credential.user.uid}`), {
        uid: credential.user.uid, name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim(), status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      });
      await signOut(auth);
      alert('가입 완료되었습니다.');
      location.href = 'login.html';
    } catch (error) {
      if (createdUser) await deleteUser(createdUser).catch(() => {});
      showStatus(signupForm, friendlyError(error), true);
      alert(`회원가입 실패되었습니다.\n${friendlyError(error)}`);
    } finally {
      button.disabled = false;
    }
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = loginForm.querySelector('button[type="submit"]');
    button.disabled = true;
    let auth;
    let authenticated = false;
    try {
      auth = getServices().auth;
      const values = Object.fromEntries(new FormData(loginForm));
      const credential = await signInWithEmailAndPassword(auth, values.email.trim(), values.password);
      authenticated = true;
      const profile = await get(ref(getServices().database, `members/${credential.user.uid}`));
      if (!profile.exists() || profile.val().status !== 'active') {
        await signOut(auth);
        throw new Error('사용 가능한 회원 정보가 없습니다. 관리자에게 문의해 주세요.');
      }
      alert('로그인 되었습니다.');
      location.href = '../index.html';
    } catch (error) {
      if (authenticated && auth) await signOut(auth).catch(() => {});
      alert('로그인 실패되었습니다.');
      showStatus(loginForm, friendlyError(error), true);
    } finally {
      button.disabled = false;
    }
  });
}

if (adminForm) {
  adminForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = adminForm.querySelector('button[type="submit"]');
    button.disabled = true;
    let auth;
    let createdSession = false;
    try {
      const services = getServices();
      auth = services.auth;
      const values = Object.fromEntries(new FormData(adminForm));
      if (values.username.trim() !== 'admin' || !services.adminEmail || !services.adminUid) throw new Error('관리자 이메일과 UID를 Firebase 설정에 등록해야 합니다.');
      const credential = await signInWithEmailAndPassword(auth, services.adminEmail, values.password);
      createdSession = true;
      if (credential.user.uid !== services.adminUid) throw new Error('등록된 관리자 계정이 아닙니다.');
      sessionStorage.setItem('slowtrip-admin', credential.user.uid);
      alert('관리자 로그인 성공');
      location.href = 'admin.html';
    } catch (error) {
      if (createdSession && auth) await signOut(auth).catch(() => {});
      alert(`관리자 로그인 실패되었습니다.\n${friendlyError(error)}`);
      showStatus(adminForm, friendlyError(error), true);
    } finally {
      button.disabled = false;
    }
  });
}

if (getSetupError()) {
  document.querySelectorAll('.form-status').forEach((status) => {
    status.textContent = 'Firebase 연결 설정이 필요합니다. docs/FIREBASE-SETUP.md를 확인해 주세요.';
    status.classList.add('is-error');
  });
}
