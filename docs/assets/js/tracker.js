import { renderJob } from './modules/render-job.js';
import { initCardControls } from './modules/card-controls.js';

const tracker = document.querySelector(".tracker");

if (tracker) {
  const columns = ['saved', 'in-progress', 'interview', 'offer', 'denied'];
  const trackerSlides = JSON.parse(localStorage.getItem('trackerSlides')) || [];
  let savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];

  // ==========================
  // --- Функція оновлення лічильників ---
  // ==========================
  function updateCounts() {
    columns.forEach(key => {
      const col = document.getElementById(key);
      if (!col) return;
      const counter = col.querySelector('.status-count');
      const cards = col.querySelectorAll('.swiper-slide');
      if (counter) counter.textContent = cards.length;
    });
  }
  updateCounts();

  // ==========================
  // --- Збереження стану карток у трекері ---
  // ==========================
  function saveTrackerSlides() {
    const allCards = [];

    document.querySelectorAll('.status-column').forEach(col => {
      const status = col.id;
      col.querySelectorAll('.swiper-slide').forEach((card, index) => {
        const slideId = card.dataset.slideId;
        if (!slideId) return;

        allCards.push({
          slideId,
          html: card.outerHTML, // зберігаємо разом з data-slide-id
          status,
          order: index
        });
      });
    });

    localStorage.setItem('trackerSlides', JSON.stringify(allCards));
  }

  // ==========================
  // --- Завантаження карток з LocalStorage ---
  // ==========================
  function loadTrackerSlides() {
    let savedSlides = [];
    try {
      savedSlides = JSON.parse(localStorage.getItem('trackerSlides')) || [];
    } catch {
      savedSlides = [];
    }

    // ✅ 1. ОЧИЩАЄМО ВСІ СТАТИЧНІ КАРТКИ З HTML
    document.querySelectorAll('.status-cards').forEach(col => {
      col.innerHTML = '';
    });
  
    // ✅ 2. ВІДНОВЛЮЄМО КАРТКИ З LOCALSTORAGE
    columns.forEach(status => {
      const col = document.querySelector(`.status-column#${status} .status-cards`);
      if (!col) return;
  
      savedSlides
        .filter(s => s.status === status)
        .sort((a, b) => a.order - b.order)
        .forEach(s => {
          col.insertAdjacentHTML('beforeend', s.html);
        });
    });

    updateCounts();
  }

  // Завантажуємо старі картки
  loadTrackerSlides();

  // ==========================
  // --- Додавання вакансій, збережених на головній сторінці ---
  // ==========================
  if (savedJobs.length > 0) {
    savedJobs.forEach(job => {
      if (!trackerSlides.some(s => s.slideId === job.slideId)) {
        const html = renderJob(job); // рендеримо картку
        document.querySelector('#saved .status-cards').insertAdjacentHTML('beforeend', html);
        trackerSlides.push({
          slideId: job.slideId,
          html,
          status: 'saved',
          order: trackerSlides.length
        });
      }
    });

    // Зберігаємо нові картки у localStorage
    saveTrackerSlides();
    // Очищаємо savedJobs
    localStorage.setItem('savedJobs', JSON.stringify([]));
    // Оновлюємо лічильники після рендеру
    updateCounts();
  }

  // ==========================
  // --- Ініціалізація кнопок картки ---
  // ==========================
  initCardControls(() => {
    updateCounts();
    saveTrackerSlides();
  });
}