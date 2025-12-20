import { API_URL } from './modules/config.js';
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
    const profileCompletionEl = activities.querySelector('#profileCompletion');

    savedEl.textContent = localStorage.getItem('savedCount') || 0;
    inProgressEl.textContent = localStorage.getItem('inProgressCount') || 0;
    const profileData = JSON.parse(localStorage.getItem("profileData"));
    if (profileData) {
      profileCompletionEl.textContent = getProfileCompletion(profileData) + "%";
    }

    // Функція підрахунку процента заповнення профілю
    function getProfileCompletion(profileData) {
      const fields = [
        profileData.basicData.sername,
        profileData.basicData.profession,
        profileData.basicData.location,
        profileData.basicData.foto,
        profileData.basicData.resumeId,
        profileData.wishToVacancy.title,
        profileData.wishToVacancy.location,
        profileData.wishToVacancy.workFormat?.length ? profileData.wishToVacancy.workFormat[0] : "",
        profileData.wishToVacancy.employmentType?.length ? profileData.wishToVacancy.employmentType[0] : "",
        profileData.wishToVacancy.experience?.length ? profileData.wishToVacancy.experience[0] : ""
      ];
      const filled = fields.filter(v => v !== null && v !== "" && v !== undefined).length;
      return Math.round((filled / fields.length) * 100);
    }
  };

  // --- Функція для збору даних з картки ---
  function getJobDataFromSlide(slide) {
    return {
      jobId: Number(slide.dataset.slideId),
      title: slide.querySelector('.position')?.textContent.trim() || '',
      company: slide.querySelector('.company')?.textContent.trim() || '',
      location: slide.querySelector('.location')?.textContent.trim() || '',
      salary: slide.querySelector('.salary')?.textContent.trim() || '',
      matchScore: slide.querySelector('.match')?.textContent.trim() || '--% match',
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
      const res = await fetch(`${API_URL}/api/jobs`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Помилка сервера: ${res.status}`);
      }

      const jobs = await res.json();
      // Якщо jobs не масив, кидаємо помилку (без цього нічого не відобразиться)
      if (!Array.isArray(jobs)) throw new Error("Сервер недоступний або повернув не масив");

      isServerAvailable = true;

      // Не рендеримо картки, які є в трекері
      const trackerSlides = JSON.parse(localStorage.getItem('trackerSlides') || '[]');
      const trackerIds = trackerSlides.map(s => s.jobId);
      const jobsToRender = jobs.filter(job => !trackerIds.includes(job.id));

      swiperWrapper.innerHTML = ''; // очищаємо Swiper перед рендером
      jobsToRender.forEach(job => {
        const slide = renderSlide(job);
        swiperWrapper.appendChild(slide);
        const resumeId = JSON.parse(localStorage.getItem("profileData"))?.basicData?.resumeId;
        if (resumeId) {
          updateMatchForSlide(slide, resumeId);
        } else {
          console.warn("⚠️ Резюме відсутнє — неможливо обчислити збіг (match).");
        }
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

    // Ініціалізація модалки додавання картки-слайду
    modalAddVacation(cardsSwiper, saveSlides, () => isServerAvailable);
  }
  loadSlidesFromServer();

  // --- Оновлення match для всіх карток ---
  async function updateMatchForSlide(slide, resumeId) {
    const matchEl = slide.querySelector('.match');

    try {
      const token = localStorage.getItem("jwtToken");
      const jobId = Number(slide.dataset.slideId);
      if (!jobId) {
        console.warn("Не вказано slideId для слайда");
        return;
      }

      const res = await fetch(`${API_URL}/api/job-matches/resume/${resumeId}?jobId=${jobId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        console.warn(`Помилка при отриманні match для slideId=${jobId}: ${res.status}`);
        matchEl.textContent = "--% match";
        return;
      }

      const data = await res.json();
      const matchObj = data[0]; // беремо перший елемент масиву
      const score = matchObj?.matchScore != null ? Math.round(matchObj.matchScore) : "--";
      matchEl.textContent = `${score}% match`;

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
    // Передаємо слайд у модалку
    openEditModal(slide);
  });

  // --- Слухач для кнопок "В трекер" ---
  swiperWrapper.addEventListener('click', async (e) => {
    const target = e.target.closest('.move-to-tracker');
    if (!target) return;

    // якщо сервер недоступний — блокуємо
    if (!isServerAvailable) {
      alert("Сервер недоступний. Перенесення картки у трекер неможливе.");
      return;
    }

    const slide = target.closest('.swiper-slide');
    // Збираємо дані картки
    const jobData = getJobDataFromSlide(slide);

    try {
      const token = localStorage.getItem("jwtToken");
      const decoded = jwt_decode(token);
      const userId = decoded.userId;

      // --- Переносимо (фактично створюємо) картку у трекер ---
      const res = await fetch(`${API_URL}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userId, jobId: Number(slide.dataset.slideId) })
      });

      if (!res.ok) {
        console.warn(`Помилка при збереженні у трекер: ${await res.text()}`);
        return;
      }

      // У разі успішної відповіді сервера зберігаємо у localStorage (trackerSlides) для трекера
      const trackerSlides = JSON.parse(localStorage.getItem('trackerSlides') || '[]');
      trackerSlides.push({
        ...jobData,
        status: 'saved', // картки потрапляють у колонку "saved"
        order: trackerSlides.length
      });
      localStorage.setItem('trackerSlides', JSON.stringify(trackerSlides));

      // Видаляємо локально картку зі слайдера та оновлюємо Swiper
      const index = Array.from(swiperWrapper.children).indexOf(slide);
      if (index > -1) {
        cardsSwiper.removeSlide(index);
        cardsSwiper.update();
      }

      // Видаляємо з jobSlides у localStorage
      let slides = JSON.parse(localStorage.getItem("jobSlides") || "[]");
      slides = slides.filter(s => s.jobId != Number(slide.dataset.slideId));
      localStorage.setItem("jobSlides", JSON.stringify(slides));

      alert("Картку збережено у трекер та надіслано на сервер!");

    } catch (err) {
      console.warn(err);
      alert("Сервер недоступний. Спробуйте пізніше.");
    }
  });
}