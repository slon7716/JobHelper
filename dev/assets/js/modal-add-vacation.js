// if (document.querySelector('.main-page')) {
//   const openModal = document.getElementById('openModal');
//   const closeModal = document.getElementById('closeModal');
//   const modalCard = document.getElementById('jobModal');
//   const jobForm = document.getElementById('jobForm');
//   const swiperWrapper = document.querySelector('.swiper-wrapper');

//   if (openModal && closeModal && modalCard && jobForm && swiperWrapper) {
//     const submitBtn = jobForm.querySelector('button[type="submit"]');
//     if (submitBtn) submitBtn.disabled = true; // кнопка вимкнена на старті

//     // Функція перевірки форми (тільки перші 5 інпутів)
//     function checkFormValidity() {
//       const mainFields = [
//         jobForm.querySelector('#position'),
//         jobForm.querySelector('#company'),
//         jobForm.querySelector('#location'),
//         jobForm.querySelector('#salary'),
//         jobForm.querySelector('#format')
//       ];

//       let allFilled = mainFields.every(field => (field.value || '').trim() !== '');
//       if (submitBtn) submitBtn.disabled = !allFilled;
//     }

//     // Додаємо слухачі до перших 5 полів
//     jobForm.querySelectorAll('#position, #company, #location, #salary, #format')
//       .forEach(el => el.addEventListener('input', checkFormValidity));

//     // Відкрити модалку
//     openModal.addEventListener('click', () => {
//       modalCard.style.display = 'block';
//       const firstField = jobForm.querySelector('input, textarea');
//       if (firstField) firstField.focus();
//       checkFormValidity(); // перевірка при відкритті
//     });

//     // Закрити модалку
//     closeModal.addEventListener('click', () => {
//       modalCard.style.display = 'none';
//     });

//     // Закрити по кліку поза вікном
//     window.addEventListener('click', (e) => {
//       if (e.target === modalCard) {
//         modalCard.style.display = 'none';
//       }
//     });

//     // Сабміт форми
//     jobForm.addEventListener('submit', (e) => {
//       e.preventDefault();
//       const formData = new FormData(jobForm);
//       const data = Object.fromEntries(formData.entries());

//       // Створюємо нову картку
//       const newSlide = document.createElement('div');
//       newSlide.classList.add('swiper-slide');

//       // Навички
//       const skillsHTML = Array.from(jobForm.querySelectorAll('input[name="skills[]"]'))
//         .map(skillInput => skillInput.value.trim())
//         .filter(Boolean)
//         .map(skill => `
//           <div class="required-skills-item">
//             <img src="assets/img/ellipse-grey.svg" alt="item">
//             <div>${skill}</div>
//           </div>
//         `).join('') || '&nbsp;'; // якщо пусто — пробіл

//       // Опис вакансії
//       const descriptionHTML = data.description?.trim() || '&nbsp;';

//       newSlide.innerHTML = `
//         <div class="job-title">
//           <div class="position">${data.position}</div>
//           <div class="job-details">
//             <div class="items">
//               <img src="assets/img/building.svg" alt="icon">
//               <div class="item company-name">${data.company}</div>
//             </div>
//             <div class="items">
//               <img src="assets/img/location.svg" alt="location">
//               <div class="item location">${data.location}</div>
//             </div>
//             <div class="items">
//               <img src="assets/img/pig.svg" alt="pig">
//               <div class="item salary">${data.salary}</div>
//             </div>
//           </div>
//           <div class="match">00%</div>
//         </div>
//         <div class="characteristic-name work-format">
//           <div class="title">Формат роботи:</div>
//           <div class="format">${data.format}</div>
//         </div>
//         <div class="characteristic-name required-skills">
//           <div class="title">Необхідні навички:</div>
//           <div class="required-skills-list">
//             ${skillsHTML}
//           </div>
//         </div>
//         <div class="characteristic-name job-description">
//           <div class="title">Опис вакансії:</div>
//           <div class="descripion">${descriptionHTML}</div>
//         </div>
//         <div class="btns">
//           <button class="btn btn-secondary">Скасувати</button>
//           <button class="btn btn-primary">Зберегти</button>
//         </div>
//       `;

//       // Додаємо картку на початок
//       swiperWrapper.insertBefore(newSlide, swiperWrapper.firstChild);

//       // Оновлюємо Swiper, щоб він підхопив новий елемент
//       if (typeof cardsSwiper !== 'undefined') {
//         cardsSwiper.update();
//         cardsSwiper.slideTo(0); // одразу показати перший слайд
//       }

//       // Закриваємо модалку і чистимо форму
//       modalCard.style.display = 'none';
//       jobForm.reset();
//       if (submitBtn) submitBtn.disabled = true; // знову блокуємо кнопку
//     });
//   }
// }

if (document.querySelector('.main-page')) {
  const openModal = document.getElementById('openModal');
  const closeModal = document.getElementById('closeModal');
  const modalCard = document.getElementById('jobModal');
  const jobForm = document.getElementById('jobForm');
  const swiperWrapper = document.querySelector('.swiper-wrapper');

  if (openModal && closeModal && modalCard && jobForm && swiperWrapper) {
    const submitBtn = jobForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true; // кнопка вимкнена на старті

    // Функція перевірки перших 5 полів
    function checkFormValidity() {
      const mainFields = [
        jobForm.querySelector('#position'),
        jobForm.querySelector('#company'),
        jobForm.querySelector('#location'),
        jobForm.querySelector('#salary'),
        jobForm.querySelector('#format')
      ];
      let allFilled = mainFields.every(field => (field.value || '').trim() !== '');
      if (submitBtn) submitBtn.disabled = !allFilled;
    }

    // Додаємо слухачі до перших 5 полів
    jobForm.querySelectorAll('#position, #company, #location, #salary, #format')
      .forEach(el => el.addEventListener('input', checkFormValidity));

    // Функція збереження карток у localStorage
    function saveSlides() {
      const slidesHTML = Array.from(swiperWrapper.children).map(slide => slide.innerHTML);
      localStorage.setItem('jobSlides', JSON.stringify(slidesHTML));
    }

    // Відкрити модалку
    openModal.addEventListener('click', () => {
      modalCard.style.display = 'block';
      const firstField = jobForm.querySelector('input, textarea');
      if (firstField) firstField.focus();
      checkFormValidity();
    });

    // Закрити модалку
    closeModal.addEventListener('click', () => {
      modalCard.style.display = 'none';
    });

    // Закрити по кліку поза вікном
    window.addEventListener('click', (e) => {
      if (e.target === modalCard) {
        modalCard.style.display = 'none';
      }
    });

    // Завантаження карток із LocalStorage при старті
    const savedSlides = JSON.parse(localStorage.getItem('jobSlides') || '[]');

    if (savedSlides.length > 0) {
      swiperWrapper.innerHTML = ''; // очищаємо, щоб не було дублів
    
      savedSlides.forEach(html => {
        const slide = document.createElement('div');
        slide.classList.add('swiper-slide');
        slide.innerHTML = html;
    
        // Додаємо слухач для кнопки “Скасувати”
        const cancelBtn = slide.querySelector('.btn-secondary');
        if (cancelBtn) {
          cancelBtn.addEventListener('click', () => {
            slide.remove();
            saveSlides();
          });
        }
    
        swiperWrapper.appendChild(slide);
      });
    } else {
      // Якщо LocalStorage пустий — зберігаємо початкові картки з HTML
      saveSlides();
    }

    // Сабміт форми
    jobForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(jobForm);
      const data = Object.fromEntries(formData.entries());

      // Створюємо нову картку
      const newSlide = document.createElement('div');
      newSlide.classList.add('swiper-slide');

      // Навички
      const skillsHTML = Array.from(jobForm.querySelectorAll('input[name="skills[]"]'))
        .map(skillInput => skillInput.value.trim())
        .filter(Boolean)
        .map(skill => `
          <div class="required-skills-item">
            <img src="assets/img/ellipse-grey.svg" alt="item">
            <div>${skill}</div>
          </div>
        `).join('') || '&nbsp;'; // якщо пусто — пробіл

      // Опис вакансії
      const descriptionHTML = data.description?.trim() || '&nbsp;';

      newSlide.innerHTML = `
        <div class="job-title">
          <div class="position">${data.position}</div>
          <div class="job-details">
            <div class="items">
              <img src="assets/img/building.svg" alt="icon">
              <div class="item company-name">${data.company}</div>
            </div>
            <div class="items">
              <img src="assets/img/location.svg" alt="location">
              <div class="item location">${data.location}</div>
            </div>
            <div class="items">
              <img src="assets/img/pig.svg" alt="pig">
              <div class="item salary">${data.salary}</div>
            </div>
          </div>
          <div class="match">00%</div>
        </div>
        <div class="characteristic-name work-format">
          <div class="title">Формат роботи:</div>
          <div class="format">${data.format}</div>
        </div>
        <div class="characteristic-name required-skills">
          <div class="title">Необхідні навички:</div>
          <div class="required-skills-list">
            ${skillsHTML}
          </div>
        </div>
        <div class="characteristic-name job-description">
          <div class="title">Опис вакансії:</div>
          <div class="descripion">${descriptionHTML}</div>
        </div>
        <div class="btns">
          <button class="btn btn-secondary">Скасувати</button>
          <button class="btn btn-primary">Зберегти</button>
        </div>
      `;

      // Додаємо картку на початок
      swiperWrapper.insertBefore(newSlide, swiperWrapper.firstChild);

      // Слухач для кнопки “Скасувати”
      const cancelBtn = newSlide.querySelector('.btn-secondary');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          newSlide.remove();
          saveSlides();
        });
      }

      // Оновлюємо Swiper
      if (typeof cardsSwiper !== 'undefined') {
        cardsSwiper.update();
        cardsSwiper.slideTo(0);
      }

      // Зберігаємо картки після додавання нової
      saveSlides();

      // Закриваємо модалку і чистимо форму
      modalCard.style.display = 'none';
      jobForm.reset();
      if (submitBtn) submitBtn.disabled = true;
    });
  }
}

