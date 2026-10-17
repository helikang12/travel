const menuButton = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
const scrollTopButton = document.querySelector('.scroll-top');

function updateScrollTopButton() {
  scrollTopButton?.classList.toggle('is-visible', window.scrollY > 0);
}

window.addEventListener('scroll', updateScrollTopButton, { passive: true });
updateScrollTopButton();

scrollTopButton?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? '메뉴 열기' : '메뉴 닫기');
  primaryNav?.classList.toggle('is-open', !isOpen);
});

primaryNav?.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    primaryNav.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', '메뉴 열기');
  }
});

const searchForm = document.querySelector('#destination-search');
const searchInput = document.querySelector('#place-query');
const searchMessage = document.querySelector('#search-message');
const destinationCards = [...document.querySelectorAll('.destination-card')];
const emptyState = document.querySelector('#empty-state');

function filterDestinations(query = '') {
  const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');
  let visibleCount = 0;

  destinationCards.forEach((card) => {
    const searchableText = `${card.dataset.search} ${card.textContent}`.toLocaleLowerCase('ko-KR');
    const matches = !normalizedQuery || searchableText.includes(normalizedQuery);
    card.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  emptyState.hidden = visibleCount !== 0;
  searchMessage.textContent = normalizedQuery
    ? `${visibleCount}개의 추천 여행지를 찾았어요. 여행지 정보는 안내용 예시입니다.`
    : '날짜와 객실 가능 여부는 숙소에 직접 확인해 주세요.';
  document.querySelector('#destinations')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  filterDestinations(searchInput?.value ?? '');
});

document.querySelector('[data-show-all]')?.addEventListener('click', (event) => {
  event.preventDefault();
  if (searchInput) searchInput.value = '';
  filterDestinations();
});

document.querySelector('#newsletter-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = document.querySelector('#newsletter-message');
  if (message) message.textContent = '구독 기능은 아직 연결되지 않았어요. 현재 입력한 정보는 전송되지 않았습니다.';
});
