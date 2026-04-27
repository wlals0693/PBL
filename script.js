const addLionBtn = document.getElementById('addLionBtn');
const deleteLastLionBtn = document.getElementById('deleteLastLionBtn');
const showDraftBtn = document.getElementById('showDraftBtn');
const addFormModal = document.getElementById('addFormModal');
const draftViewModal = document.getElementById('draftViewModal');
const addLionForm = document.getElementById('addLionForm');
const draftStatus = document.getElementById('draftStatus');
const draftContent = document.getElementById('draftContent');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const saveDraftBtn = document.getElementById('saveDraftBtn');
const closeDraftBtn = document.getElementById('closeDraftBtn');

const draftLabels = {
  name: '이름',
  role: '역할',
  intro: '자기소개',
  email: '이메일',
  phone: '전화번호',
  github: '깃허브 URL',
  skills: '관심 기술',
  comment: '한 마디',
};

window.addEventListener('DOMContentLoaded', function () {
  loadFromStorage();
  updateCardCount();
});

addLionBtn.addEventListener('click', showAddForm);
deleteLastLionBtn.addEventListener('click', deleteLastLion);
showDraftBtn.addEventListener('click', showDraftView);
cancelAddBtn.addEventListener('click', closeAddForm);
saveDraftBtn.addEventListener('click', saveCurrentDraft);
closeDraftBtn.addEventListener('click', closeDraftView);
addLionForm.addEventListener('submit', handleAddLionSubmit);
addFormModal.addEventListener('click', closeModalOnBackdrop);
draftViewModal.addEventListener('click', closeModalOnBackdrop);

function openModal(modal) {
  modal.hidden = false;
}

function closeModal(modal) {
  modal.hidden = true;
}

function closeModalOnBackdrop(e) {
  if (e.target === e.currentTarget) {
    closeModal(e.currentTarget);
  }
}

function showAddForm() {
  addLionForm.reset();
  draftStatus.textContent = '';
  openModal(addFormModal);
}

function closeAddForm() {
  closeModal(addFormModal);
}

function showDraftView() {
  renderDraftView();
  openModal(draftViewModal);
}

function closeDraftView() {
  closeModal(draftViewModal);
}

function handleAddLionSubmit(e) {
  e.preventDefault();

  if (!isValidName(addLionForm.name.value)) {
    addLionForm.name.focus();
    return;
  }

  if (!isValidEmail(addLionForm.email.value)) {
    addLionForm.email.focus();
    return;
  }

  if (!isValidGithubUrl(addLionForm.github.value)) {
    return;
  }

  addLionCard(getLionDataFromForm(addLionForm));
  closeAddForm();
}

function isValidName(name) {
  if (name.trim()) {
    return true;
  }

  alert('이름을 입력해주세요.');
  return false;
}

function isValidEmail(email) {
  if (!email || email.includes('@')) {
    return true;
  }

  alert('이메일 형식이 올바르지 않습니다. @를 포함해주세요.');
  return false;
}

function isValidGithubUrl(url) {
  if (!url || url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }

  alert('깃허브 URL은 http:// 또는 https:// 로 시작해야 합니다.');
  return false;
}

function getLionDataFromForm(form) {
  const formData = new FormData(form);

  return {
    name: formData.get('name')?.trim() || '',
    role: formData.get('role') || '',
    intro: formData.get('intro')?.trim() || '',
    email: formData.get('email')?.trim() || '',
    phone: formData.get('phone')?.trim() || '',
    github: formData.get('github')?.trim() || '',
    skills: formData.get('skills')?.trim() || '',
    comment: formData.get('comment')?.trim() || '',
  };
}

function saveCurrentDraft() {
  sessionStorage.setItem(
    'lionDraftData',
    JSON.stringify(getLionDataFromForm(addLionForm)),
  );
  draftStatus.textContent =
    '임시저장되었습니다. 임시저장 보기에서 확인할 수 있습니다.';
}

function getDraftFromSession() {
  const draftData = sessionStorage.getItem('lionDraftData');

  return draftData ? JSON.parse(draftData) : null;
}

function renderDraftView() {
  const draftData = getDraftFromSession();
  draftContent.replaceChildren();

  if (!draftData) {
    draftContent.append(createTextRow('임시저장된 정보가 없습니다.'));
    return;
  }

  Object.entries(draftLabels).forEach(([key, label]) => {
    draftContent.append(createTextRow(`${label}: ${draftData[key] || '-'}`));
  });
}

function createTextRow(text) {
  const row = document.createElement('p');
  row.textContent = text;
  return row;
}

function loadFromStorage() {
  const storedData = localStorage.getItem('lionData');
  if (!storedData) return;

  const lionData = JSON.parse(storedData);
  const container = document.querySelector('.container_short');

  container.querySelectorAll('.introduce_short').forEach((card, index) => {
    if (index > 0) card.remove();
  });

  document.querySelectorAll('.introduce_long').forEach((card) => {
    card.remove();
  });

  lionData.forEach((data) => {
    addLionCard(data, false);
  });
}

function saveToStorage() {
  const shortCards = document.querySelectorAll('.introduce_short');
  const longCards = document.querySelectorAll('.introduce_long');
  const lionData = [];

  for (let i = 1; i < shortCards.length; i++) {
    const shortCard = shortCards[i];
    const longCard =
      longCards.length === shortCards.length ? longCards[i] : longCards[i - 1];

    lionData.push({
      name: shortCard.querySelector('h2').textContent,
      role: shortCard.querySelector('.my_part').textContent,
      intro: shortCard.querySelector('p:last-child').textContent,
      email: getLongCardText(longCard, 0, '이메일: '),
      phone: getLongCardText(longCard, 1, '전화번호: '),
      github: longCard.querySelector('a')?.href || '',
      skills: getLongCardSkills(longCard).join(', '),
      comment: longCard.querySelector('.lion_comment')?.textContent || '',
    });
  }

  localStorage.setItem('lionData', JSON.stringify(lionData));
}

function getLongCardText(card, index, prefix) {
  return (
    card.querySelectorAll('li')[index]?.textContent.replace(prefix, '') || ''
  );
}

function getLongCardSkills(card) {
  const skillsHeader = Array.from(card.querySelectorAll('h3')).find(
    (header) => header.textContent === '관심 기술',
  );
  const skills = [];
  let nextElement = skillsHeader?.nextElementSibling;

  while (nextElement?.tagName === 'LI') {
    skills.push(nextElement.textContent);
    nextElement = nextElement.nextElementSibling;
  }

  return skills;
}

function deleteLastLion() {
  const shortCards = document.querySelectorAll('.introduce_short');
  const longCards = document.querySelectorAll('.introduce_long');

  if (shortCards.length <= 1) {
    alert('최소 1명의 아기사자는 남겨야 합니다!');
    return;
  }

  shortCards[shortCards.length - 1].remove();
  longCards[longCards.length - 1].remove();
  updateCardCount();
  saveToStorage();
}

function addLionCard(data, saveStorage = true) {
  document.querySelector('.container_short').append(createShortCard(data));
  document.body.insertBefore(createLongCard(data), addFormModal);
  updateCardCount();

  if (saveStorage) {
    saveToStorage();
  }
}

function createShortCard(data) {
  const card = document.createElement('div');
  card.className = 'introduce_short';
  card.innerHTML = `
    <div class="image_part">
      <img src="images/sec.jpg" alt="소개 이미지" />
      <span class="badge"></span>
    </div>
    <h2></h2>
    <p class="my_part"></p>
    <p></p>
  `;

  card.querySelector('.badge').textContent = data.role;
  card.querySelector('h2').textContent = data.name;
  card.querySelector('.my_part').textContent = data.role;
  card.querySelector('p:last-child').textContent = data.intro;

  return card;
}

function createLongCard(data) {
  const card = document.createElement('div');
  const skills = data.skills
    ? data.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  card.className = 'introduce_long';
  card.innerHTML = `
    <h1></h1>
    <p class="my_part"></p>
    <h3>자기소개</h3>
    <p class="lion_intro"></p>
    <h3>연락처</h3>
    <li class="lion_email"></li>
    <li class="lion_phone"></li>
    <li>웹사이트: <a>깃허브 주소</a></li>
    <h3>관심 기술</h3>
    <h3>한 마디</h3>
    <p class="lion_comment"></p>
  `;

  card.querySelector('h1').textContent = data.name;
  card.querySelector('.my_part').textContent = data.role;
  card.querySelector('.lion_intro').textContent = data.intro;
  card.querySelector('.lion_email').textContent = `이메일: ${data.email}`;
  card.querySelector('.lion_phone').textContent = `전화번호: ${data.phone}`;
  card.querySelector('a').href = data.github || '#';
  card.querySelector('.lion_comment').textContent = data.comment;

  const commentHeader = card.querySelector('h3:last-of-type');
  skills.forEach((skill) => {
    const item = document.createElement('li');
    item.textContent = skill;
    card.insertBefore(item, commentHeader);
  });

  return card;
}

function updateCardCount() {
  const countElement = document.getElementById('cardCount');
  const cardCount = document.querySelectorAll('.introduce_short').length;
  countElement.textContent = `아기사자: ${cardCount}명`;
}
