import { getServices, getSetupError } from './firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';
import { ref, get, push, set, update } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-database.js';

const notice = document.querySelector('#dashboard-notice');
const statBox = document.querySelector('#dashboard-stats');
const tables = { destinations: {}, stays: {}, reservations: {}, members: {} };
const labels = { requested: '신청 확인 중', confirmed: '확정', cancel_requested: '취소 요청', canceled: '취소', completed: '완료' };
const dateLabel = (value) => value ? new Date(value).toLocaleDateString('ko-KR') : '—';
const escapeText = (value) => String(value ?? '');

if (getSetupError()) {
  notice.textContent = 'Firebase 설정을 완료해야 관리자 대시보드를 사용할 수 있습니다. docs/FIREBASE-SETUP.md를 확인해 주세요.';
} else {
  const services = getServices();
  const { auth, database, adminUid } = services;
  onAuthStateChanged(auth, async (user) => {
    if (!user || !adminUid || user.uid !== adminUid || sessionStorage.getItem('slowtrip-admin') !== user.uid) {
      location.replace('admin-login.html');
      return;
    }
    try {
      await loadAll();
    } catch (error) {
      notice.textContent = `데이터를 불러오지 못했습니다. Realtime Database 규칙과 관리자 UID를 확인해 주세요. (${error.message})`;
      notice.classList.add('is-error');
    }
  });

  async function readCollection(path) {
    const snapshot = await get(ref(database, path));
    return snapshot.exists() ? snapshot.val() : {};
  }

  async function loadAll() {
    [tables.destinations, tables.stays, tables.reservations, tables.members] = await Promise.all([
      readCollection('destinations'), readCollection('stays'), readCollection('reservations'), readCollection('members')
    ]);
    notice.textContent = 'Firebase Realtime Database의 현재 운영 데이터를 표시하고 있습니다.';
    notice.classList.remove('is-error');
    renderAll();
  }

  function renderAll() {
    renderStats(); renderDestinations(); renderStays(); renderReservations(); renderMembers(); populateDestinationSelect();
  }

  function renderStats() {
    const reservations = Object.values(tables.reservations);
    const stats = [
      ['회원', Object.keys(tables.members).length],
      ['공개 여행지', Object.values(tables.destinations).filter((item) => item.status === 'published').length],
      ['활성 숙소', Object.values(tables.stays).filter((item) => item.status === 'active').length],
      ['예약 신청', reservations.filter((item) => item.status === 'requested').length],
      ['확정 예약', reservations.filter((item) => item.status === 'confirmed').length]
    ];
    statBox.replaceChildren(...stats.map(([label, value]) => {
      const card = document.createElement('article'); card.className = 'stat-card';
      const name = document.createElement('span'); name.textContent = label;
      const number = document.createElement('strong'); number.textContent = value;
      card.append(name, number); return card;
    }));
  }

  function button(label, action, key) {
    const element = document.createElement('button'); element.type = 'button'; element.className = 'row-action'; element.textContent = label;
    if (key) element.dataset[action] = key;
    return element;
  }

  function addCell(row, value) { const cell = document.createElement('td'); cell.textContent = escapeText(value); row.append(cell); return cell; }

  function renderDestinations() {
    const body = document.querySelector('#destination-rows'); body.replaceChildren();
    Object.entries(tables.destinations).forEach(([id, item]) => {
      const row = document.createElement('tr'); addCell(row, item.name); addCell(row, item.region); addCell(row, item.status);
      const actions = document.createElement('td'); actions.append(button('수정', 'editDestination', id), button(item.status === 'hidden' ? '숨김 해제' : '숨김', 'hideDestination', id)); row.append(actions); body.append(row);
    });
    if (!body.children.length) body.innerHTML = '<tr><td colspan="4" class="empty-cell">등록된 여행지가 없습니다.</td></tr>';
  }

  function renderStays() {
    const body = document.querySelector('#stay-rows'); body.replaceChildren();
    Object.entries(tables.stays).forEach(([id, item]) => {
      const row = document.createElement('tr'); addCell(row, item.name); addCell(row, tables.destinations[item.destinationId]?.name || item.destinationId); addCell(row, `${Number(item.pricePerNight || 0).toLocaleString('ko-KR')}원`); addCell(row, item.status);
      const actions = document.createElement('td'); actions.append(button('수정', 'editStay', id), button(item.status === 'inactive' ? '활성화' : '비활성화', 'toggleStay', id)); row.append(actions); body.append(row);
    });
    if (!body.children.length) body.innerHTML = '<tr><td colspan="5" class="empty-cell">등록된 숙소가 없습니다.</td></tr>';
  }

  function renderReservations() {
    const body = document.querySelector('#reservation-rows'); body.replaceChildren();
    Object.entries(tables.reservations).forEach(([id, item]) => {
      const row = document.createElement('tr'); addCell(row, id); addCell(row, tables.members[item.memberId]?.name || item.memberId); addCell(row, tables.stays[item.stayId]?.name || item.stayId); addCell(row, `${item.checkIn || '—'} ~ ${item.checkOut || '—'}`); addCell(row, `${item.guestCount || 0}명 · ${Number(item.totalPrice || 0).toLocaleString('ko-KR')}원`); addCell(row, labels[item.status] || item.status);
      const cell = document.createElement('td');
      if (item.status === 'requested') cell.append(button('확정', 'confirmReservation', id), button('취소 처리', 'cancelReservation', id));
      else if (item.status === 'cancel_requested') cell.append(button('취소 승인', 'cancelReservation', id));
      else cell.textContent = '—';
      row.append(cell); body.append(row);
    });
    if (!body.children.length) body.innerHTML = '<tr><td colspan="7" class="empty-cell">예약 기록이 없습니다.</td></tr>';
  }

  function renderMembers() {
    const body = document.querySelector('#member-rows'); body.replaceChildren();
    const query = document.querySelector('#member-search').value.trim().toLocaleLowerCase('ko-KR');
    Object.entries(tables.members).filter(([, item]) => `${item.name} ${item.email}`.toLocaleLowerCase('ko-KR').includes(query)).forEach(([id, item]) => {
      const row = document.createElement('tr'); addCell(row, item.name); addCell(row, item.email); addCell(row, item.phone); addCell(row, item.status); addCell(row, dateLabel(item.createdAt));
      const detail = document.createElement('tr'); detail.className = 'member-detail-row'; const cell = document.createElement('td'); cell.colSpan = 5;
      const detailButton = button('상세 정보 보기', 'memberDetail', id); cell.append(detailButton); detail.append(cell); body.append(row, detail);
    });
    if (!body.children.length) body.innerHTML = '<tr><td colspan="5" class="empty-cell">검색 결과가 없습니다.</td></tr>';
  }

  function populateDestinationSelect() {
    const select = document.querySelector('#stay-destination'); const prior = select.value;
    select.replaceChildren(new Option('여행지를 선택해 주세요', ''));
    Object.entries(tables.destinations).forEach(([id, item]) => select.add(new Option(`${item.name} (${item.region})`, id)));
    if (prior) select.value = prior;
  }

  document.querySelectorAll('.dashboard-tabs button').forEach((tab) => tab.addEventListener('click', () => {
    document.querySelectorAll('.dashboard-tabs button').forEach((item) => item.classList.toggle('is-active', item === tab));
    document.querySelectorAll('.dashboard-panel').forEach((panel) => { panel.hidden = panel.id !== `panel-${tab.dataset.panel}`; });
  }));

  document.querySelector('[data-new="destination"]').addEventListener('click', () => showForm('destination-form'));
  document.querySelector('[data-new="stay"]').addEventListener('click', () => showForm('stay-form'));
  document.querySelectorAll('[data-cancel-form]').forEach((button) => button.addEventListener('click', () => { button.closest('form').hidden = true; }));
  document.querySelector('#member-search').addEventListener('input', renderMembers);

  document.querySelector('#destination-rows').addEventListener('click', async (event) => {
    const edit = event.target.closest('[data-edit-destination]'); const hide = event.target.closest('[data-hide-destination]');
    if (edit) fillForm('destination-form', edit.dataset.editDestination, tables.destinations[edit.dataset.editDestination]);
    if (hide) {
      const id = hide.dataset.hideDestination; const nextStatus = tables.destinations[id].status === 'hidden' ? 'published' : 'hidden';
      if (!confirm(nextStatus === 'hidden' ? '여행지를 숨김 처리할까요? 연결된 예약 기록은 유지됩니다.' : '여행지를 다시 공개할까요?')) return;
      await update(ref(database, `destinations/${id}`), { status: nextStatus, updatedAt: new Date().toISOString() }); await loadAll();
    }
  });

  document.querySelector('#stay-rows').addEventListener('click', async (event) => {
    const edit = event.target.closest('[data-edit-stay]'); const toggle = event.target.closest('[data-toggle-stay]');
    if (edit) fillForm('stay-form', edit.dataset.editStay, tables.stays[edit.dataset.editStay]);
    if (toggle) {
      const id = toggle.dataset.toggleStay; const nextStatus = tables.stays[id].status === 'inactive' ? 'active' : 'inactive';
      if (!confirm(nextStatus === 'inactive' ? '숙소를 비활성화할까요? 예약 기록은 유지됩니다.' : '숙소를 다시 활성화할까요?')) return;
      await update(ref(database, `stays/${id}`), { status: nextStatus, updatedAt: new Date().toISOString() }); await loadAll();
    }
  });

  document.querySelector('#reservation-rows').addEventListener('click', async (event) => {
    const confirmButton = event.target.closest('[data-confirm-reservation]'); const cancelButton = event.target.closest('[data-cancel-reservation]');
    const id = confirmButton?.dataset.confirmReservation || cancelButton?.dataset.cancelReservation;
    if (!id) return;
    const status = confirmButton ? 'confirmed' : 'canceled';
    if (confirm(`예약 상태를 '${labels[status]}'(으)로 변경할까요?`)) {
      await update(ref(database, `reservations/${id}`), { status, updatedAt: new Date().toISOString() }); await loadAll();
    }
  });

  document.querySelector('#member-rows').addEventListener('click', (event) => {
    const detail = event.target.closest('[data-member-detail]'); if (!detail) return;
    const member = tables.members[detail.dataset.memberDetail];
    const history = Object.entries(tables.reservations).filter(([, item]) => item.memberId === detail.dataset.memberDetail).map(([id, item]) => `${id} · ${item.checkIn} ~ ${item.checkOut} · ${labels[item.status] || item.status}`);
    alert(`회원 상세\n이름: ${member.name || '—'}\n이메일: ${member.email || '—'}\n연락처: ${member.phone || '—'}\n상태: ${member.status || '—'}\n가입일: ${dateLabel(member.createdAt)}\n\n예약 이력\n${history.length ? history.join('\n') : '예약 이력이 없습니다.'}`);
  });

  document.querySelector('#destination-form').addEventListener('submit', async (event) => {
    event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form)); const id = values.id; delete values.id;
    try { await saveRecord('destinations', id, values); form.reset(); form.hidden = true; notice.textContent = '여행지 정보를 저장했습니다.'; await loadAll(); }
    catch (error) { alert(`저장 실패: ${error.message}`); }
  });
  document.querySelector('#stay-form').addEventListener('submit', async (event) => {
    event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form)); const id = values.id; delete values.id;
    values.pricePerNight = Number(values.pricePerNight); values.maxGuests = Number(values.maxGuests);
    try { await saveRecord('stays', id, values); form.reset(); form.hidden = true; notice.textContent = '숙소 정보를 저장했습니다.'; await loadAll(); }
    catch (error) { alert(`저장 실패: ${error.message}`); }
  });

  async function saveRecord(path, id, values) {
    const now = new Date().toISOString();
    if (id) await update(ref(database, `${path}/${id}`), { ...values, updatedAt: now });
    else { const record = push(ref(database, path)); await set(record, { ...values, createdAt: now, updatedAt: now }); }
  }
  function showForm(id) { const form = document.getElementById(id); form.reset(); form.elements.id.value = ''; form.hidden = false; form.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  function fillForm(formId, id, value) {
    const form = document.getElementById(formId); form.hidden = false; form.elements.id.value = id;
    Object.entries(value).forEach(([key, item]) => { if (form.elements[key]) form.elements[key].value = item; });
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  document.querySelector('#admin-logout').addEventListener('click', async () => {
    await signOut(auth); sessionStorage.removeItem('slowtrip-admin'); alert('관리자 로그아웃되었습니다.'); location.replace('../index.html');
  });
}
