import { modalAddVacation } from './modules/modal-add-vacation.js';
import { modalEditVacation } from './modules/modal-edit-vacation.js';

const mainPage = document.querySelector('.main-page');

if (mainPage) {
  const swiperWrapper = document.querySelector('.swiper-wrapper');

  // Функція збереження карток у localStorage
  function saveSlides() {
    const slidesData = Array.from(swiperWrapper.children).map(slide => ({
      slideId: slide.dataset.slideId, // зберігаємо унікальний id картки
      html: slide.innerHTML           // і її вміст
    }));
    localStorage.setItem('jobSlides', JSON.stringify(slidesData));
  }

  // --- Завантаження карток із LocalStorage при старті ---
  const savedSlides = JSON.parse(localStorage.getItem('jobSlides') || '[]');
  if (savedSlides.length > 0) {
    swiperWrapper.innerHTML = ''; // очищаємо, щоб не було дублів
    savedSlides.forEach(slideData => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');
      slide.dataset.slideId = slideData.slideId; // відновлюємо id
      slide.innerHTML = slideData.html;          // відновлюємо HTML
      swiperWrapper.appendChild(slide);
    });
  } else {
    // Якщо LocalStorage пустий — зберігаємо початкові картки з HTML
    saveSlides();
  }

  // --- Ініціалізація модалок ---
  modalAddVacation(cardsSwiper, saveSlides);
  modalEditVacation(cardsSwiper, saveSlides);

  // --- Функція для збору даних з картки ---
  function getJobDataFromSlide(slide) {
    return {
      id: slide.dataset.slideId,
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

  // Слухач для кнопок "В трекер" (на картках)
  swiperWrapper.addEventListener('click', async (e) => {
    const target = e.target.closest('.move-to-tracker');
    if (!target) return;
    const slide = target.closest('.swiper-slide');
    if (!slide) return;

    // Збираємо дані через функцію
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

      // Додаємо картку одразу у трекер
      if (typeof window.renderJob === 'function') {
        window.renderJob(jobData, 'saved');
      }

      // Видаляємо картку зі слайдера та оновлюємо
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