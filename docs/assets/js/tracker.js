document.addEventListener('DOMContentLoaded', () => {
  const columns = document.querySelectorAll('.status-column .status-cards');
  if (!columns.length) return;

  // Функція для оновлення лічильників
  function updateCounts() {
    document.querySelectorAll('.status-column').forEach(col => {
      const count = col.querySelectorAll('.swiper-slide').length;
      const counter = col.querySelector('.status-count');
      if (counter) counter.textContent = count;
    });
  }

  // Збереження стану колонок у localStorage
  function saveColumnsState() {
    const state = {};
    document.querySelectorAll('.status-column').forEach(col => {
      const key = col.classList.contains('status-saved') ? 'saved' :
                  col.classList.contains('status-in-progress') ? 'inProgress' :
                  col.classList.contains('status-done') ? 'done' : null;
      if (!key) return;
      state[key] = Array.from(col.querySelectorAll('.swiper-slide')).map(card => card.dataset.job);
    });
    localStorage.setItem('columnsState', JSON.stringify(state));
  }

  function renderJob(job, targetColumn = 'saved') {
    const column = document.querySelector(`.status-column.status-${targetColumn} .status-cards`);
    if (!column) return;

    const div = document.createElement('div');
    div.classList.add('swiper-slide');
    div.dataset.job = JSON.stringify(job); // зберігаємо дані картки

    div.innerHTML = `
      <div class="job-title">
        <div class="position-and-control">
          <div class="position">${job.position}</div>
          <div class="control-buttons">
            <button type="button" class="btn-close">
              <img src="assets/img/close-grey.svg" alt="close">
            </button>
            <button type="button" class="btn-expand">
              <img src="assets/img/extand-grey.svg" alt="expand">
            </button>
            <button type="button" class="btn-transfer">
              <img src="assets/img/transfer-grey.svg" alt="transfer">
            </button>
          </div>
        </div>
        <div class="job-details">
          <div class="items">
            <img src="assets/img/building.svg" alt="icon">
            <div class="item company-name">${job.company}</div>
          </div>
          <div class="items">
            <img src="assets/img/location.svg" alt="location">
            <div class="item location">${job.location}</div>
          </div>
          <div class="items">
            <img src="assets/img/pig.svg" alt="pig">
            <div class="item salary">${job.salary}</div>
          </div>
        </div>
        <div class="match">85% match</div>
      </div>
      <div class="characteristic-name work-format">
        <div class="title">Формат роботи:</div>
        <div class="format">${job.format}</div>
      </div>
      <div class="characteristic-name required-skills">
        <div class="title">Необхідні навички:</div>
        <div class="required-skills-list">
          ${Array.isArray(job.skills) ? job.skills.map(skill => `
            <div class="required-skills-item">
              <img src="assets/img/ellipse-grey.svg" alt="item">
              <div>${skill}</div>
            </div>
          `).join('') : ''}
        </div>
      </div>
      <div class="characteristic-name job-description">
        <div class="title">Опис вакансії:</div>
        <div class="description">${job.description}</div>
      </div>
    `;
    column.appendChild(div);
    updateCounts();
    saveColumnsState();
  }

  // Відновлюємо стан колонок після перезавантаження
  const savedState = JSON.parse(localStorage.getItem('columnsState') || '{}');
  for (const [colKey, jobs] of Object.entries(savedState)) {
    jobs.forEach(jobStr => {
      if (!jobStr) return;
      let job;
      try {
        job = JSON.parse(jobStr);
      } catch(e) {
        console.warn('Невдалий парсинг job:', jobStr);
        return;
      }
      if (!job || typeof job !== 'object') return;
      renderJob(job, colKey);
    });
  }
  
  // Додаємо картки з savedJobs лише якщо їх ще немає в columnsState
  const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
  const jobsInColumns = new Set(
    Object.values(savedState).flat().map(str => str)
  );
  
  savedJobs.forEach(job => {
    const jobStr = JSON.stringify(job);
    if (!jobsInColumns.has(jobStr)) {   // <-- додаємо лише унікальні
      renderJob(job, 'saved');
    }
  });

  // Обробка кліків для видалення та переміщення
  document.addEventListener('click', e => {
    const card = e.target.closest('.swiper-slide');
    if (!card) return;

    // Видалення
    if (e.target.closest('.btn-close')) {
      card.remove();
      updateCounts();
      saveColumnsState();
      return;
    }

    // Переміщення вправо
    if (e.target.closest('.btn-transfer')) {
      const currentColumn = card.closest('.status-column');
      const nextColumn = currentColumn ? currentColumn.nextElementSibling : null;
      if (nextColumn) {
        card.classList.add('moving');
        setTimeout(() => {
          nextColumn.querySelector('.status-cards').appendChild(card);
          card.classList.remove('moving');
          updateCounts();
          saveColumnsState();
        }, 300);
      }
    }
  });

  // Слухаємо LocalStorage події з інших сторінок
  window.addEventListener('storage', e => {
    if (e.key === 'lastAddedJob' && e.newValue) {
      const job = JSON.parse(e.newValue);
      renderJob(job, 'saved');
    }
  });

  // Початковий підрахунок при завантаженні сторінки
  updateCounts();
});