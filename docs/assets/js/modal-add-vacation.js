if (document.querySelector('.main-page')) {
  // ---------------------------
  // MOCK fetch для локального тестування (успішна відповідь)
  // ---------------------------
  // window.fetch = async function(url, options) {
  //  console.log("Mock fetch called:", url, options);
  //  return {
  //    ok: true,
  //    status: 200,
  //    json: async () => ({ message: "Успішно збережено" }),
  //    text: async () => "Успішно збережено"
  //  };
  // };
  // ---------------------------
  const openModal = document.getElementById('openModal');
  const closeModal = document.getElementById('closeModal');
  const modalCard = document.getElementById('jobModal');
  const jobForm = document.getElementById('jobForm');
  const swiperWrapper = document.querySelector('.swiper-wrapper');

  if (openModal && closeModal && modalCard && jobForm && swiperWrapper) {
    const submitBtn = jobForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const formatButtons = jobForm.querySelectorAll('.format-buttons button');
    const formatInput = jobForm.querySelector('#format');
    
    formatButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active'); // перемикаємо активний стан
    
        // формуємо значення для прихованого поля
        const activeValues = Array.from(formatButtons)
          .filter(b => b.classList.contains('active'))
          .map(b => b.dataset.value);
    
        formatInput.value = activeValues.join(', ');
        checkFormValidity();
      });
    });

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
    jobForm.addEventListener('submit', async (e) => {
      e.preventDefault();
    
      const formData = new FormData(jobForm);
      const data = Object.fromEntries(formData.entries());
    
      // Навички
      const skills = Array.from(jobForm.querySelectorAll('input[name="skills[]"]'))
                          .map(input => input.value.trim())
                          .filter(Boolean);
    
      const jobData = {
        title: data.position,
        description: data.description,
        requiredSkills: skills || [],
        company: data.company,
        location: data.location,
        salary: parseFloat(data.salary),
        workFormat: data.format
      };
    
      try {
        const token = localStorage.getItem("jwtToken"); // якщо потрібен токен
        const res = await fetch("http://localhost:8080/api/jobs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(jobData)
        });
    
        // не додаємо картку, якщо сервер повернув помилку
        if (!res.ok) {
          const err = await res.text();
          alert("Помилка від сервера: " + err);
          return;
        }
    
        // --- Якщо сервер відповів успішно, додаємо картку локально ---
        const newSlide = document.createElement('div');
        newSlide.classList.add('swiper-slide');
    
        const skillsHTML = skills.map(skill => `
          <div class="required-skills-item">
            <img src="assets/img/ellipse-grey.svg" alt="item">
            <div>${skill}</div>
          </div>
        `).join('') || '&nbsp;';
    
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
            <div class="match">00% match</div>
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
    
        // Додаємо на початок слайдера
        swiperWrapper.insertBefore(newSlide, swiperWrapper.firstChild);
    
        // Слухач кнопки “Скасувати”
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
    
        // Зберігаємо локально
        saveSlides();
    
        // Закриваємо модалку і чистимо форму
        modalCard.style.display = 'none';
        jobForm.reset();
        if (submitBtn) submitBtn.disabled = true;
    
        alert("Вакансію додано на сервер та локально!");
    
      } catch (err) {
        alert("Помилка мережі: " + err);
      }
    });
    
    // Слухач для кнопок "Зберегти" (на картках)
    swiperWrapper.addEventListener('click', async (e) => {
      if (e.target.classList.contains('btn-primary')) {
        const slide = e.target.closest('.swiper-slide');
        if (!slide) return;
    
        // Збираємо дані з картки
        const jobData = {
          position: slide.querySelector('.position')?.textContent.trim() || '',
          company: slide.querySelector('.company-name')?.textContent.trim() || '',
          location: slide.querySelector('.location')?.textContent.trim() || '',
          salary: slide.querySelector('.salary')?.textContent.trim() || '',
          format: slide.querySelector('.format')?.textContent.trim() || '',
          skills: Array.from(slide.querySelectorAll('.required-skills-item div'))
            .map(el => el.textContent.trim())
            .filter(Boolean),
          description: slide.querySelector('.descripion')?.textContent.trim() || ''
        };
    
        try {
          const token = localStorage.getItem("jwtToken"); // використовується, якщо потрібен
          const res = await fetch("http://localhost:8080/api/jobs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(jobData)
          });
    
          if (res.ok) {
            // --- Додаємо до savedJobs для трекера заявок ---
            const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
            savedJobs.push(jobData);
            localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    
            // Видаляємо картку зі слайдера
            slide.remove();
            saveSlides(); // оновлюємо jobSlides
    
            // Оновлюємо Swiper
            if (typeof cardsSwiper !== 'undefined') {
              cardsSwiper.update();
            }
    
            alert("Картку збережено та надіслано на сервер!");
          } else {
            const err = await res.text();
            alert("Помилка при збереженні: " + err);
          }
        } catch (err) {
          alert("Помилка мережі: " + err);
        }
      }
    });
  }
}