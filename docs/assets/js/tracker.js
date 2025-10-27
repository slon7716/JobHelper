import { renderJob } from './modules/render-job.js';
import { initCardControls } from './modules/card-controls.js';

const tracker = document.querySelector(".tracker");

if (tracker) {
  const columns = ['saved', 'in-progress', 'interview', 'offer', 'denied'];
  let isServerAvailable = false;

  // ==========================
  // --- Оновлення лічильників ---
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
  // --- Збереження карток у localStorage ---
  // ==========================
  function saveTrackerSlides() {
    const allCardsData = [];

    document.querySelectorAll('.status-column').forEach(col => {
      const status = col.id;
      col.querySelectorAll('.swiper-slide').forEach((card, index) => {
        const slideId = card.dataset.slideId;
        if (!slideId) return;
        // Збираємо дані картки
        const jobData = {
          slideId,
          title: card.querySelector('.position')?.textContent.trim() || '',
          company: card.querySelector('.company')?.textContent.trim() || '',
          location: card.querySelector('.location')?.textContent.trim() || '',
          salary: card.querySelector('.salary')?.textContent.trim() || '',
          workFormat: card.querySelector('.format')?.textContent.trim() || '',
          requiredSkills: Array.from(card.querySelectorAll('.required-skills-item div'))
            .map(el => el.textContent.trim())
            .filter(Boolean),
          description: card.querySelector('.description')?.textContent.trim() || '',
          status,    // статус колонки
          order: index  // позиція в колонці
        };
        allCardsData.push(jobData);
      });
    });
  
    localStorage.setItem('trackerSlides', JSON.stringify(allCardsData));
  }
  
  // ==========================
  // --- Завантаження карток з сервера ---
  // ==========================
  async function loadTrackerSlidesFromServer() {
    const savedLocalCards = JSON.parse(localStorage.getItem('trackerSlides') || '[]');
    const userId = 1;
  
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`http://localhost:8080/api/applications/user/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
  
      if (!res.ok) throw new Error(`Помилка сервера: ${res.status}`);
  
      const applications = await res.json();
      if (!Array.isArray(applications)) throw new Error("Сервер недоступний або повернув не масив");
  
      // --- Очищаємо колонки
      document.querySelectorAll('.status-cards').forEach(col => col.innerHTML = '');
  
      // --- Рендеримо всі картки з сервера
      applications.forEach(job => {
        const col = document.querySelector(`.status-column#${job.status} .status-cards`);
        if (!col) return;
        col.insertAdjacentHTML('beforeend', renderJob(job));
      });
  
      // --- Синхронізуємо локально trackerSlides
      localStorage.setItem('trackerSlides', JSON.stringify(applications));

      isServerAvailable = true;

    } catch (err) {
      console.error("Використовується кеш localStorage:", err);
      isServerAvailable = false; // сервер недоступний
      // --- fallback: рендеримо локальні картки
      document.querySelectorAll('.status-cards').forEach(col => col.innerHTML = '');
      savedLocalCards.forEach(job => {
        const col = document.querySelector(`.status-column#${job.status} .status-cards`);
        if (!col) return;
        col.insertAdjacentHTML('beforeend', renderJob(job));
      });
    }
  
    updateCounts();
  
    // --- Ініціалізація кнопок картки ---
    initCardControls(() => {
      updateCounts();
      saveTrackerSlides();
    }, isServerAvailable);
  }
  
  loadTrackerSlidesFromServer();
}