// 아기사자 추가하기 버튼 이벤트
document.querySelector('.btn_top').addEventListener('click', function () {
  showAddForm();
});

// 마지막 아기사자 삭제하기 버튼 이벤트
document.querySelectorAll('.btn_top')[1].addEventListener('click', function () {
  deleteLastLion();
});
// 페이지 로드 시 로컬 스토리지에서 데이터 복원
window.addEventListener('DOMContentLoaded', function () {
  loadFromStorage();
});

// 로컬 스토리지에서 데이터 로드
function loadFromStorage() {
  const storedData = localStorage.getItem('lionData');
  if (!storedData) return;

  const lionData = JSON.parse(storedData);

  // 기존 카드들 제거 (첫 번째 제외 - 메인카드)
  const container = document.querySelector('.container_short');
  const existingCards = container.querySelectorAll('.introduce_short');
  existingCards.forEach((card, index) => {
    if (index > 0) card.remove();
  });

  // 기존 상세 카드들 제거
  const existingLongCards = document.querySelectorAll('.introduce_long');
  existingLongCards.forEach((card) => card.remove());

  // 저장된 데이터로 카드 생성
  lionData.forEach((data) => {
    addLionCard(data, false);
  });

  updateCardCount();
}

// 로컬 스토리지에 데이터 저장
function saveToStorage() {
  const shortCards = document.querySelectorAll('.introduce_short');
  const longCards = document.querySelectorAll('.introduce_long');

  const lionData = [];

  // 메인카드는 제외하고 저장 (index 0)
  for (let i = 1; i < shortCards.length; i++) {
    const shortCard = shortCards[i];
    const longCard = longCards[i - 1];

    const name = shortCard.querySelector('h2').textContent;
    const role = shortCard.querySelector('.my_part').textContent;
    const intro = shortCard.querySelector('p:last-child').textContent;

    // 상세 카드에서 정보 추출
    const email =
      longCard.querySelectorAll('li')[0]?.textContent.replace('이메일: ', '') ||
      '';
    const phone =
      longCard
        .querySelectorAll('li')[1]
        ?.textContent.replace('전화번호: ', '') || '';
    const github = longCard.querySelector('a')?.href || '';

    // 관심 기술은 "관심 기술" h3 다음의 li들
    const allHeaders = longCard.querySelectorAll('h3');
    const skillsHeader = Array.from(allHeaders).find(
      (h) => h.textContent === '관심 기술',
    );
    const skills = [];
    if (skillsHeader) {
      let nextElement = skillsHeader.nextElementSibling;
      while (nextElement && nextElement.tagName === 'LI') {
        skills.push(nextElement.textContent);
        nextElement = nextElement.nextElementSibling;
      }
    }

    const comment =
      longCard.querySelector('h3:last-child + p')?.textContent || '';

    lionData.push({
      name,
      role,
      intro,
      email,
      phone,
      github,
      skills: skills.join(', '),
      comment,
    });
  }

  localStorage.setItem('lionData', JSON.stringify(lionData));
}
// 마지막 아기사자 삭제 함수
function deleteLastLion() {
  const shortCards = document.querySelectorAll('.introduce_short');
  const longCards = document.querySelectorAll('.introduce_long');

  if (shortCards.length <= 1) {
    alert('최소 1명의 아기사자는 남겨야 합니다!');
    return;
  }

  // 마지막 짧은 카드 삭제
  const lastShortCard = shortCards[shortCards.length - 1];
  lastShortCard.remove();

  // 마지막 상세 카드 삭제
  const lastLongCard = longCards[longCards.length - 1];
  lastLongCard.remove();

  // 카드 개수 업데이트
  updateCardCount();

  // 스토리지 저장
  saveToStorage();
}

// 폼 표시 함수
function showAddForm() {
  // 기존 폼이 있으면 제거
  const existingForm = document.getElementById('addFormModal');
  if (existingForm) {
    existingForm.remove();
  }

  // 모달 배경 생성
  const modal = document.createElement('div');
  modal.id = 'addFormModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;

  // 폼 컨테이너 생성
  const formContainer = document.createElement('div');
  formContainer.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 15px;
    width: 600px;
    max-width: 95%;
  `;

  // 폼 제목
  const title = document.createElement('h2');
  title.textContent = '새 아기사자 추가';
  title.style.marginBottom = '20px';

  // 폼 요소 생성
  const form = document.createElement('form');
  form.id = 'addLionForm';
  form.style.cssText =
    'display: grid; grid-template-columns: 1fr 1fr; gap: 15px;';

  const fields = [
    { label: '이름', name: 'name', type: 'text', grid: true },
    {
      label: '역할',
      name: 'role',
      type: 'select',
      options: ['Backend', 'Frontend', 'Design'],
      grid: true,
    },
    { label: '자기소개', name: 'intro', type: 'text', grid: false },
    { label: '이메일', name: 'email', type: 'email', grid: true },
    { label: '전화번호', name: 'phone', type: 'tel', grid: true },
    { label: '깃허브 URL', name: 'github', type: 'text', grid: false },
    {
      label: '관심 기술 (쉼표로 구분)',
      name: 'skills',
      type: 'text',
      grid: false,
    },
    { label: '한 마디', name: 'comment', type: 'text', grid: false },
  ];

  fields.forEach((field) => {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = field.grid ? '' : 'grid-column: 1 / -1;';

    const label = document.createElement('label');
    label.textContent = field.label;
    label.style.cssText =
      'display: block; margin-bottom: 5px; font-weight: bold;';

    let input;
    if (field.type === 'select') {
      input = document.createElement('select');
      field.options.forEach((option) => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        input.appendChild(opt);
      });
    } else {
      input = document.createElement('input');
      input.type = field.type;
    }
    input.name = field.name;
    input.required = field.name === 'name';
    input.style.cssText =
      'width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box;';

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    form.appendChild(wrapper);
  });

  // 버튼 그룹
  const buttonGroup = document.createElement('div');
  buttonGroup.style.cssText =
    'display: flex; gap: 10px; justify-content: flex-end;';

  // 취소 버튼
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.textContent = '취소';
  cancelBtn.style.cssText =
    'padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; background: #ccc;';
  cancelBtn.onclick = function () {
    modal.remove();
  };

  // 추가 버튼
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = '추가';
  submitBtn.style.cssText =
    'padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; background: #4CAF50; color: white;';

  buttonGroup.appendChild(cancelBtn);
  buttonGroup.appendChild(submitBtn);
  form.appendChild(buttonGroup);

  // 폼 제출 이벤트
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // 이메일 형식 검사
    const emailInput = form.querySelector('input[name="email"]');
    if (emailInput && !emailInput.value.includes('@')) {
      alert('이메일 형식이 올바르지 않습니다. @를 포함해주세요.');
      return;
    }

    // URL 형식 검사
    const githubInput = form.querySelector('input[name="github"]');
    if (
      githubInput &&
      githubInput.value &&
      !githubInput.value.startsWith('http')
    ) {
      alert('깃허브 URL은 http:// 또는 https:// 로 시작해야 합니다.');
      return;
    }

    addNewLion(form);
    modal.remove();
  });

  formContainer.appendChild(title);
  formContainer.appendChild(form);
  modal.appendChild(formContainer);
  document.body.appendChild(modal);

  // 모달 배경 클릭 시 닫기
  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// 새 아기사자 추가 함수
function addNewLion(form) {
  const formData = new FormData(form);
  const data = {
    name: formData.get('name'),
    role: formData.get('role'),
    intro: formData.get('intro'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    github: formData.get('github'),
    skills: formData.get('skills'),
    comment: formData.get('comment'),
  };

  addLionCard(data, true);
}

// 카드 추가 공통 함수
function addLionCard(data, saveStorage = true) {
  // 새 카드 생성
  const container = document.querySelector('.container_short');
  const newCard = document.createElement('div');
  newCard.className = 'introduce_short';
  newCard.innerHTML = `
    <div class="image_part">
      <img src="images/sec.jpg" alt="소개 이미지" />
      <span class="badge">${data.role}</span>
    </div>
    <h2>${data.name}</h2>
    <p class="my_part">${data.role}</p>
    <p>${data.intro}</p>
  `;

  container.appendChild(newCard);

  // 상세 정보 추가
  const skillsArray = data.skills
    ? data.skills.split(',').map((s) => s.trim())
    : [];
  const skillsHtml = skillsArray.map((skill) => `<li>${skill}</li>`).join('');

  const longCard = document.createElement('div');
  longCard.className = 'introduce_long';
  longCard.innerHTML = `
    <h1>${data.name}</h1>
    <p class="my_part">${data.role}</p>
    <h3>자기소개</h3>
    <p>${data.intro}</p>
    <h3>연락처</h3>
    <li>이메일: ${data.email || ''}</li>
    <li>전화번호: ${data.phone || ''}</li>
    <li>웹사이트: <a href="${data.github || '#'}">깃허브 주소</a></li>
    <h3>관심 기술</h3>
    ${skillsHtml}
    <h3>한 마디</h3>
    ${data.comment || ''}
  `;

  document.body.appendChild(longCard);

  // 카드 개수 업데이트
  updateCardCount();

  // 스토리지 저장
  if (saveStorage) {
    saveToStorage();
  }
}

// 카드 개수 업데이트 함수
function updateCardCount() {
  const cards = document.querySelectorAll('.introduce_short');
  const countElement = document.getElementById('cardCount');
  countElement.textContent = `아기사자: ${cards.length}명`;
}
