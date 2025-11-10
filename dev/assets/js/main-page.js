import { modalAddVacation } from './modules/modal-add-vacation.js';
import { modalEditVacation } from './modules/modal-edit-vacation.js';
import { renderSlide } from './modules/render-slide.js';
import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode/build/jwt-decode.esm.js';

const mainPage = document.querySelector('.main-page');

if (mainPage) {
  const swiperWrapper = document.querySelector('.swiper-wrapper');
  let isServerAvailable = false;

  // Відображення кількості у activities
  const activities = document.querySelector('.activities');
  if (activities) {
    const savedEl = activities.querySelector('#savedCount');
    const inProgressEl = activities.querySelector('#inProgressCount');

    const savedCount = localStorage.getItem('savedCount') || 0;
    const inProgressCount = localStorage.getItem('inProgressCount') || 0;

    if (savedEl) savedEl.textContent = savedCount;
    if (inProgressEl) inProgressEl.textContent = inProgressCount;
  };

  // --- Функція для збору даних з картки ---
  function getJobDataFromSlide(slide) {
    return {
      slideId: slide.dataset.slideId,
      title: slide.querySelector('.position')?.textContent.trim() || '',
      company: slide.querySelector('.company')?.textContent.trim() || '',
      location: slide.querySelector('.location')?.textContent.trim() || '',
      salary: slide.querySelector('.salary')?.textContent.trim() || '',
      match: slide.querySelector('.match')?.textContent.trim() || '--',
      workFormat: slide.querySelector('.format')?.textContent.trim() || '',
      requiredSkills: Array.from(slide.querySelectorAll('.required-skills-item div'))
        .map(el => el.textContent.trim())
        .filter(Boolean),
      description: slide.querySelector('.description')?.textContent.trim() || ''
    };
  }

  // Функція збереження карток у localStorage
  function saveSlides() {
    const slidesData = Array.from(swiperWrapper.children)
      .map(slide => getJobDataFromSlide(slide));
    // Зберігаємо масив об’єктів у localStorage
    localStorage.setItem('jobSlides', JSON.stringify(slidesData));
  }

  // --- Завантаження карток із сервера при старті ---
  async function loadSlidesFromServer() {
    const savedServerSlides = JSON.parse(localStorage.getItem('jobSlides') || '[]');

    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch("http://localhost:8080/api/jobs", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Помилка сервера: ${res.status}`);
      }

      const jobs = await res.json();
      // Якщо jobs не масив, кидаємо помилку (без цього нічого не відобразиться )
      if (!Array.isArray(jobs)) throw new Error("Сервер недоступний або повернув не масив");

      isServerAvailable = true;

      swiperWrapper.innerHTML = ''; // очищаємо Swiper перед рендером
      jobs.forEach(job => {
        const slide = renderSlide(job);
        swiperWrapper.appendChild(slide);
        const resumeId = JSON.parse(localStorage.getItem("profileData"))?.basicData?.resumeId;
        if (resumeId) updateMatchForSlide(slide, resumeId);
      });

      // Зберігаємо локально
      saveSlides();

    } catch (err) {
      console.error("Використовується кеш з localStorage", err);
      isServerAvailable = false;
      // fallback: якщо сервер недоступний, показуємо з localStorage
      if (savedServerSlides.length) {
        swiperWrapper.innerHTML = ''; // очищаємо Swiper перед рендером локального кешу
        savedServerSlides.forEach(jobData => swiperWrapper.appendChild(renderSlide(jobData)));
      }
    }

    // Оновлюємо Swiper
    if (typeof cardsSwiper !== 'undefined') {
      cardsSwiper.update();
    }
    
    // --- Ініціалізація модалки додавання картки-слайду ---
    modalAddVacation(cardsSwiper, saveSlides, () => isServerAvailable);
  }
  loadSlidesFromServer();

  // Оновлення match для всіх карток
  async function updateMatchForSlide(slide, resumeId) {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`http://localhost:8080/api/ai-resume-analysis/${resumeId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
  
      if (!res.ok) return;
  
      const data = await res.json();
      const matchEl = slide.querySelector('.match');
      if (matchEl) matchEl.textContent = `${data.match ?? "--"}% match`;
    } catch (err) {
      console.warn("Не вдалося отримати match:", err);
      matchEl.textContent = "--% match";
    }
  }

  // --- Ініціалізація модалки редагування ---
  const { openEditModal } = modalEditVacation(cardsSwiper, saveSlides);

  // --- Слухач для кнопок "Змінити" (на картках) ---
  swiperWrapper.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-edit');
    if (!btn) return;

    if (!isServerAvailable) {
      alert("Сервер недоступний. Зміни картки неможливі.");
      return;
    }

    const slide = btn.closest('.swiper-slide');
    if (!slide) return;

    // Передаємо слайд у модалку
    openEditModal(slide);
  });

  // --- Слухач для кнопок "В трекер" (на картках) ---
  swiperWrapper.addEventListener('click', async (e) => {
    const target = e.target.closest('.move-to-tracker');
    if (!target) return;

    // якщо сервер недоступний — блокуємо
    if (!isServerAvailable) {
      alert("Сервер недоступний. Перенесення картки у трекер неможливе.");
      return;
    }

    const slide = target.closest('.swiper-slide');
    if (!slide) return;
    // Збираємо дані картки
    const jobData = getJobDataFromSlide(slide);

    try {
      const token = localStorage.getItem("jwtToken");
      const decoded = jwt_decode(token);
      const userId = decoded.userId;
      const jobId = slide.dataset.slideId;
      const res = await fetch("http://localhost:8080/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userId, jobId })
      });

      if (!res.ok) {
        const err = await res.text();
        alert("Помилка при збереженні: " + err);
        return;
      }

      // У разі успішної відповіді сервера зберігаємо у localStorage (trackerSlides) для трекера
      const trackerSlides = JSON.parse(localStorage.getItem('trackerSlides') || '[]');
      trackerSlides.push({
        ...jobData,
        status: 'saved',       // картки потрапляють у колонку "saved"
        order: trackerSlides.length
      });
      localStorage.setItem('trackerSlides', JSON.stringify(trackerSlides));

      // Видаляємо картку зі слайдера та оновлюємо Swiper
      slide.remove();
      saveSlides();
      if (typeof cardsSwiper !== 'undefined') {
        cardsSwiper.update();
      }

      alert("Картку збережено у трекер та надіслано на сервер!");
    } catch (err) {
      alert("Помилка мережі: " + err);
    }
  });
}