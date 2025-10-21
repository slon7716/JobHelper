import { modalAddVacation } from './modules/modal-add-vacation.js';
import { modalEditVacation } from './modules/modal-edit-vacation.js';
import { renderSlide } from './modules/render-slide.js';

const mainPage = document.querySelector('.main-page');

if (mainPage) {
  const swiperWrapper = document.querySelector('.swiper-wrapper');

  // --- Функція для збору даних з картки ---
  function getJobDataFromSlide(slide) {
    return {
      slideId: slide.dataset.slideId,
      title: slide.querySelector('.position')?.textContent.trim() || '',
      company: slide.querySelector('.company')?.textContent.trim() || '',
      location: slide.querySelector('.location')?.textContent.trim() || '',
      salary: slide.querySelector('.salary')?.textContent.trim() || '',
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
    const savedSlides = JSON.parse(localStorage.getItem('jobSlides') || '[]');
    
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch("http://localhost:8080/api/jobs", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error(`Помилка сервера: ${res.status}`);
      }
      
      const jobs = await res.json();
      // Якщо jobs не масив, кидаємо помилку
      if (!Array.isArray(jobs)) throw new Error("Сервер повернув не масив");
  
      jobs.forEach(job => swiperWrapper.appendChild(renderSlide(job)));
      // Зберігаємо локально як кеш
      saveSlides();
      
    } catch (err) {
      console.error("Сервер недоступний — використовується кеш з localStorage", err);
      // fallback: якщо сервер недоступний, показуємо те, що є в localStorage
      if (savedSlides.length) {
        swiperWrapper.innerHTML = ''; // очищаємо Swiper перед рендером локального кешу
        savedSlides.forEach(jobData => swiperWrapper.appendChild(renderSlide(jobData)));
      }
    }

    // Оновлюємо Swiper
    if (typeof cardsSwiper !== 'undefined') {
      cardsSwiper.update();
    }
  }
  
  // Викликаємо при старті сторінки
  loadSlidesFromServer();

  // --- Ініціалізація модалок ---
  modalAddVacation(cardsSwiper, saveSlides);
  modalEditVacation(cardsSwiper, saveSlides);

  // Слухач для кнопок "В трекер" (на картках)
  swiperWrapper.addEventListener('click', async (e) => {
    const target = e.target.closest('.move-to-tracker');
    if (!target) return;
    const slide = target.closest('.swiper-slide');
    if (!slide) return;
    // Збираємо дані картки
    const jobData = getJobDataFromSlide(slide);

    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch("http://localhost:8080/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });

      if (!res.ok) {
        const err = await res.text();
        alert("Помилка при збереженні: " + err);
        return;
      }

      // Зберігаємо у savedJobs для трекера
      const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      savedJobs.push(jobData);
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs));

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