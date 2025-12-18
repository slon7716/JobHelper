import { renderJob } from './modules/render-job.js';
import { initCardControls } from './modules/card-controls.js';
import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/build/jwt-decode.esm.js';

const tracker = document.querySelector(".tracker");

if (tracker) {
  const columns = ['saved', 'in-progress', 'interview', 'offer', 'denied'];
  let isServerAvailable = false;

  // ==========================
  // --- Оновлення лічильників ---
  // ==========================
  function updateCounts() {
    let savedCount = 0;
    let inProgressCount = 0;
    columns.forEach(key => {
      const col = document.getElementById(key);
      if (!col) return;
      const counter = col.querySelector('.status-count');
      const cards = col.querySelectorAll('.swiper-slide');
      if (counter) counter.textContent = cards.length;
      if (key === 'saved') savedCount = cards.length;
      if (key === 'in-progress') inProgressCount = cards.length;
    });
    // --- Зберігаємо перші 2 показники в localStorage для головної сторінки ---
    localStorage.setItem('savedCount', savedCount);
    localStorage.setItem('inProgressCount', inProgressCount);
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
          matchScore: card.querySelector('.match')?.textContent.trim() || "--% match",
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

    try {
      const token = localStorage.getItem("jwtToken");
      const decoded = jwt_decode(token);
      const userId = decoded.userId; // отримуємо userID з токена
      const res = await fetch(`${API_URL}/api/applications/user/${userId}`, {
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

      // --- Створюємо відповідність статусів з сервером
      const statusMap = {
        PENDING: 'saved',
        IN_REVIEW: 'in-progress',
        INTERVIEW: 'interview',
        OFFER: 'offer',
        REJECTED: 'denied',
      };

      // --- Рендеримо картки з сервера ---
      applications.forEach(job => {
        const mappedStatus = statusMap[job.status];
        if (Array.isArray(job.requiredSkills)) { // прибираємо дублікати навичок
          job.requiredSkills = [...new Set(job.requiredSkills)];
        }
        const col = document.querySelector(`.status-column#${mappedStatus} .status-cards`);
        if (!col) return;
        col.insertAdjacentHTML('beforeend', renderJob(job));
      });

      // --- Оновлення match для всіх карток ---
      const resumeId = JSON.parse(localStorage.getItem("profileData"))?.basicData?.resumeId;

      if (resumeId) {
        for (const slide of document.querySelectorAll('.swiper-slide')) {
          const slideId = slide.dataset.slideId;
          const matchEl = slide.querySelector('.match');

          if (!slideId || !matchEl) {
            if (matchEl) matchEl.textContent = "--% match";
            continue;
          }

          try {
            const resMatch = await fetch(`${API_URL}/api/job-matches/resume/${resumeId}?jobId=${slideId}`, {
              headers: { "Authorization": `Bearer ${token}` }
            });

            if (!resMatch.ok) {
              if (matchEl) matchEl.textContent = "--% match";
              continue;
            }

            const data = await resMatch.json();
            const matchObj = data[0]; // перший елемент
            matchEl.textContent = `${matchObj?.matchScore != null ? Math.round(matchObj.matchScore) : "--"}% match`;

          } catch (err) {
            matchEl.textContent = "--% match";
            console.warn("Не вдалося отримати match:", err);
          }
        };
      } else { // Якщо resumeId немає, встановлюємо "--% match"
        document.querySelectorAll('.swiper-slide').forEach(slide => {
          const matchEl = slide.querySelector('.match');
          matchEl.textContent = "--% match";
        });
        console.warn("⚠️ Резюме відсутнє — неможливо обчислити збіг (match).");
      }

      // --- Синхронізуємо локально trackerSlides
      localStorage.setItem('trackerSlides', JSON.stringify(applications));

      isServerAvailable = true;

    } catch (err) {
      console.error("Використовується кеш localStorage:", err);
      isServerAvailable = false; // сервер недоступний
      // --- fallback: рендеримо локальні картки
      document.querySelectorAll('.status-cards').forEach(col => col.innerHTML = '');
      for (const job of savedLocalCards) {
        const col = document.querySelector(`.status-column#${job.status} .status-cards`);
        if (!col) continue;
        col.insertAdjacentHTML('beforeend', renderJob(job));
        const lastSlide = col.lastElementChild;
        const matchEl = lastSlide?.querySelector('.match');
        matchEl.textContent = job.matchScore ?? "--% match";
      }
    }

    updateCounts();

    // --- Ініціалізація кнопок картки ---
    initCardControls(() => {
      updateCounts();
      saveTrackerSlides();
    }, () => isServerAvailable);
  }

  loadTrackerSlidesFromServer();
}