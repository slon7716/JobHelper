document.addEventListener('DOMContentLoaded', () => {
   // Обираємо саме колонку "Збережені"
   const savedColumn = document.querySelector('.status-column.status-saved .status-cards');
   if (!savedColumn) return; // якщо немає, скрипт не виконується
 
   function renderJob(job) {
      const savedColumn = document.querySelector('.status-column.status-saved .status-cards');
      if (!savedColumn) return;
    
      const div = document.createElement('div');
      div.classList.add('swiper-slide');
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
          <div class="descripion">${job.description}</div>
        </div>
      `;
    
      savedColumn.appendChild(div);
    
      // Оновлюємо лічильники після додавання картки
      updateCounts();
   }
 
   // Показуємо все з LocalStorage при завантаженні
   const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
   savedJobs.forEach(renderJob);
 
   // Слухаємо події LocalStorage (наприклад, натискання "Зберегти" на іншій сторінці)
   window.addEventListener('storage', (e) => {
     if (e.key === 'lastAddedJob' && e.newValue) {
       const job = JSON.parse(e.newValue);
       renderJob(job);
     }
   });
 });
 