import { renderJob } from './modules/renderJob.js';
import { initCardControls } from './modules/cardControls.js';

const tracker = document.querySelector(".tracker");

if (tracker) {
  const columns = ['saved', 'in-progress', 'done', 'offer', 'denied'];

  // ==========================
  // --- Функція оновлення лічильників ---
  // ==========================
  function updateCounts() {
    columns.forEach(key => {
      const col = document.querySelector(`.status-column.status-${key}`);
      if (!col) return;
      const counter = col.querySelector('.status-count');
      const cards = col.querySelectorAll('.swiper-slide');
      if (counter) counter.textContent = cards.length;
    });
  }

  // ==========================
  // --- Функція збереження стану карток ---
  // ==========================
  function saveColumnsState() {
    const allJobs = [];
    document.querySelectorAll('.status-column').forEach(col => {
      const status = col.classList[1]; // saved, in-progress, done, offer, denied
      col.querySelectorAll('.swiper-slide').forEach(card => {
        if (!card.dataset.job) return; // на всяк випадок
        const job = JSON.parse(card.dataset.job);
        job.status = status; // актуальний статус
        allJobs.push(job);
      });
    });
    localStorage.setItem('savedJobs', JSON.stringify(allJobs));
  }

  // Робимо renderJob глобально доступним
  window.renderJob = renderJob;

  // ==========================
  // --- Завантажуємо картки з LocalStorage ---
  // ==========================
  let savedJobs;
  try {
    savedJobs = JSON.parse(localStorage.getItem('savedJobs'));
    if (!Array.isArray(savedJobs)) savedJobs = [];
  } catch {
    savedJobs = [];
  }

  // ==========================
  // --- Додаємо data-job для "старих" карток без dataset ---
  // ==========================
  document.querySelectorAll('.swiper-slide').forEach(card => {
    if (!card.dataset.job) {
      const job = {
        id: card.dataset.jobId || crypto.randomUUID(),
        title: card.querySelector('.position')?.textContent || '',
        company: card.querySelector('.company')?.textContent || '',
        location: card.querySelector('.location')?.textContent || '',
        salary: card.querySelector('.salary')?.textContent || '',
        workFormat: card.querySelector('.format')?.textContent || '',
        requiredSkills: [],
        description: card.querySelector('.description')?.textContent || ''
      };
      card.dataset.job = JSON.stringify(job);
      // Встановлюємо jobId для унікальності (щоб renderJob не дублив)
      card.dataset.jobId = job.id;
    }
  });

  // Рендеримо картки з LocalStorage
  savedJobs.forEach(job => renderJob(job, job.status || 'saved'));
  updateCounts();

  // ==========================
  // --- Ініціалізація кнопок картки ---
  // ==========================
  initCardControls(() => {
    updateCounts();
    saveColumnsState();
  });
}
