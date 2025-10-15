const mainPage = document.querySelector('.main-page');

if (mainPage) {
  const openModal = document.getElementById('openModal');
  const closeModal = document.getElementById('closeModal');
  const modalCard = document.getElementById('jobModal');
  const jobForm = document.getElementById('jobForm');
  const swiperWrapper = document.querySelector('.swiper-wrapper');

  if (openModal && closeModal && modalCard && jobForm && swiperWrapper) {
    const formatButtons = jobForm.querySelectorAll('.format-buttons button');
    const formatInput = jobForm.querySelector('#format');
    const submitBtn = jobForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // --- Завантаження карток із LocalStorage при старті ---
    const savedSlides = JSON.parse(localStorage.getItem('jobSlides') || '[]');
    // Функція збереження карток у localStorage
    function saveSlides() {
      const slidesData = Array.from(swiperWrapper.children).map(slide => ({
        slideId: slide.dataset.slideId, // зберігаємо унікальний id картки
        html: slide.innerHTML           // і її вміст
      }));
      localStorage.setItem('jobSlides', JSON.stringify(slidesData));
    }
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

    // --- Кнопки додавання та редагування ---
    let addBtn = jobForm.querySelector('button[type="submit"]');
    if (!addBtn) {
      const btnContainer = jobForm.querySelector('.btns');
      addBtn = document.createElement('button');
      addBtn.type = 'submit';
      addBtn.classList.add('btn', 'btn-primary');
      addBtn.textContent = 'Додати';
      btnContainer.appendChild(addBtn);
    }
    addBtn.disabled = true;

    const saveChangesBtn = document.createElement('button');
    saveChangesBtn.type = 'button';
    saveChangesBtn.classList.add('btn', 'btn-primary');
    saveChangesBtn.textContent = 'Зберегти зміни';

    const deleteJobBtn = document.createElement('button');
    deleteJobBtn.type = 'button';
    deleteJobBtn.classList.add('btn', 'btn-secondary');
    deleteJobBtn.textContent = 'Видалити вакансію';

    // Функція перевірки заповнення перших 5 полів
    function checkFormValidity(editBtn) {
      if (!editBtn) return;

      const mainFields = [
        jobForm.querySelector('#position'),
        jobForm.querySelector('#company'),
        jobForm.querySelector('#location'),
        jobForm.querySelector('#salary'),
        jobForm.querySelector('#format')
      ];

      const allFilled = mainFields.every(field => (field.value || '').trim() !== '');
      editBtn.disabled = !allFilled;
    }
    // --- формат роботи окремо, бо value ставиться програмно ---
    function attachFormatListeners(targetButton) {
      const currentFormatButtons = jobForm.querySelectorAll('.format-buttons button');

      currentFormatButtons.forEach(btn => {
        // Клонування для видалення старих слухачів
        const newBtn = btn.cloneNode(true);
        btn.replaceWith(newBtn);

        newBtn.addEventListener('click', () => {
          newBtn.classList.toggle('active');

          const activeValues = Array.from(jobForm.querySelectorAll('.format-buttons button'))
            .filter(b => b.classList.contains('active'))
            .map(b => b.dataset.value);

          formatInput.value = activeValues.join(', ');
          checkFormValidity(targetButton);
        });
      });
    }

    attachFormatListeners(addBtn);

    // --- Слухачі на поля (input + формат роботи) ---
    const mainInputs = jobForm.querySelectorAll('#position, #company, #location, #salary, #format');
    mainInputs.forEach(input => input.addEventListener('input', () => checkFormValidity(addBtn)));

    // ==========================
    // --- Додавання нової картки ---
    // ==========================
    // --- Відкрити модалку ---
    openModal.addEventListener('click', () => {
      modalCard.style.display = 'block';
      jobForm.reset();
      // Скидаємо формат роботи
      formatButtons.forEach(b => b.classList.remove('active'));
      formatInput.value = '';
      // Скидаємо стан кнопки
      addBtn.disabled = true;
      // Фокус на перше поле
      const firstField = jobForm.querySelector('input, textarea');
      if (firstField) firstField.focus();
      // Встановлюємо слухачі для формату для кнопки "Додати"
      attachFormatListeners(addBtn);
    });

    // --- Закрити модалку ---
    closeModal.addEventListener('click', () => modalCard.style.display = 'none');
    window.addEventListener('click', e => { if (e.target === modalCard) modalCard.style.display = 'none'; });

    // --- Сабміт форми ---
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
        company: data.company,
        location: data.location,
        salary: parseFloat(data.salary),
        workFormat: data.format,
        requiredSkills: skills || [],
        description: data.description
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
        const newSlideData = await res.json(); // сервер повертає створену картку разом з id
        const newSlide = document.createElement('div');
        newSlide.classList.add('swiper-slide');
        newSlide.dataset.slideId = newSlideData.id; // зберігаємо id у data-attribute

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
            <div class="description">${descriptionHTML}</div>
          </div>
          <div class="btns">
            <button class="btn btn-secondary btn-edit">Змінити</button>
            <button class="btn btn-primary">Зберегти</button>
          </div>
        `;

        // Додаємо на початок слайдера
        swiperWrapper.insertBefore(newSlide, swiperWrapper.firstChild);

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
        // !!!!! <-> <-> <-> ВИДАЛИТИ наступні 3 рядки після підключення до сервера
        if (!slide.dataset.slideId || slide.dataset.slideId === "undefined") {
          slide.dataset.slideId = 'job-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        }
        const slideId = slide.dataset.slideId;
        const jobData = {
          id: slideId,
          title: slide.querySelector('.position')?.textContent.trim() || '',
          company: slide.querySelector('.company-name')?.textContent.trim() || '',
          location: slide.querySelector('.location')?.textContent.trim() || '',
          salary: slide.querySelector('.salary')?.textContent.trim() || '',
          workFormat: slide.querySelector('.format')?.textContent.trim() || '',
          requiredSkills: Array.from(slide.querySelectorAll('.required-skills-item div'))
            .map(el => el.textContent.trim())
            .filter(Boolean),
          description: slide.querySelector('.description')?.textContent.trim() || ''
        };

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

          if (res.ok) {
            // Зберігаємо у savedJobs для трекера заявок
            const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
            savedJobs.push(jobData);
            localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
            // Додаємо картку одразу у трекер
            if (typeof window.renderJob === 'function') {
              window.renderJob(jobData, 'saved');
            }
            // Видаляємо картку зі слайдера
            slide.remove();
            saveSlides(); // оновлюємо jobSlides
            // Оновлюємо Swiper
            if (typeof cardsSwiper !== 'undefined') {
              cardsSwiper.update();
            }
            alert("Картку збережено у трекер та надіслано на сервер!");
          } else {
            const err = await res.text();
            alert("Помилка при збереженні: " + err);
          }
        } catch (err) {
          alert("Помилка мережі: " + err);
        }
      }
    });

    // ==========================
    // --- Редагування картки зі слайдера ---
    // ========================== 
    // --- Функція модалки для редагування ---
    function openEditModal(slide) {
      modalCard.style.display = 'block';
      jobForm.dataset.editingSlide = Array.from(swiperWrapper.children).indexOf(slide);

      // Зміна заголовку
      const modalHeaderTitle = modalCard.querySelector('.modal-header h5');
      if (modalHeaderTitle) modalHeaderTitle.textContent = 'Редагування вакансії';

      // Заповнюємо поля наявними даними
      jobForm.querySelector('#position').value = slide.querySelector('.position')?.textContent.trim() || '';
      jobForm.querySelector('#company').value = slide.querySelector('.company-name')?.textContent.trim() || '';
      jobForm.querySelector('#location').value = slide.querySelector('.location')?.textContent.trim() || '';
      jobForm.querySelector('#salary').value = slide.querySelector('.salary')?.textContent.trim() || '';
      jobForm.querySelector('#format').value = slide.querySelector('.format')?.textContent.trim() || '';
      jobForm.querySelector('#description').value = slide.querySelector('.description')?.textContent.trim() || '';

      // Знімаємо старі слухачі і клонування
      const formatContainer = jobForm.querySelector('.format-buttons');
      formatContainer.innerHTML = formatContainer.innerHTML; // скидаємо слухачі
      const newFormatButtons = jobForm.querySelectorAll('.format-buttons button');

      // Додаємо нові слухачі
      newFormatButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          btn.classList.toggle('active');
          const activeValues = Array.from(newFormatButtons)
            .filter(b => b.classList.contains('active'))
            .map(b => b.dataset.value);
          formatInput.value = activeValues.join(', ');
          checkFormValidity(saveChangesBtn);
        });
      });

      // Активуємо кнопки "формат роботи"
      newFormatButtons.forEach(btn => {
        btn.classList.toggle('active', slide.querySelector('.format')?.textContent.includes(btn.dataset.value));
      });

      // Навички
      const skillInputs = jobForm.querySelectorAll('input[name="skills[]"]');
      const skillDivs = slide.querySelectorAll('.required-skills-item div:last-child');
      skillInputs.forEach((input, i) => {
        input.value = skillDivs[i]?.textContent.trim() || '';
      });

      // Нові кнопки редагування
      const btnContainer = jobForm.querySelector('.btns');
      btnContainer.innerHTML = '';
      btnContainer.appendChild(saveChangesBtn);
      btnContainer.appendChild(deleteJobBtn);

      // Слухачі на основні 5 полів
      const inputs = jobForm.querySelectorAll('#position, #company, #location, #salary, #format');
      inputs.forEach(input => {
        input.addEventListener('input', () => checkFormValidity(saveChangesBtn));
      });

      // Перевірка валідації (на основні 5 полів)
      checkFormValidity(saveChangesBtn);
    }

    // --- Відкриття модалки для редагування ---
    swiperWrapper.addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn-edit')) return;
      const slide = e.target.closest('.swiper-slide');
      if (!slide) return;

      openEditModal(slide);
    });

    // --- Збереження змін у картці ---
    saveChangesBtn.addEventListener('click', async () => {
      const index = jobForm.dataset.editingSlide;
      const slide = swiperWrapper.children[index];
      if (!slide) {
        console.warn(`Картку з індексом ${index} не знайдено у swiperWrapper`);
        return;
      }
      const slideId = slide.dataset.slideId; // беремо id із картки

      const skills = Array.from(jobForm.querySelectorAll('input[name="skills[]"]'))
        .map(input => input.value.trim())
        .filter(Boolean);

      const updatedData = {
        title: jobForm.querySelector('#position').value.trim(),
        company: jobForm.querySelector('#company').value.trim(),
        location: jobForm.querySelector('#location').value.trim(),
        salary: jobForm.querySelector('#salary').value.trim(),
        workFormat: jobForm.querySelector('#format').value.trim(),
        requiredSkills: skills || [],
        description: jobForm.querySelector('#description').value.trim()
      };

      // --- Зберігаємо поточні значення для відкату на випадок помилки від сервера ---
      const oldData = {
        title: slide.querySelector('.position').textContent,
        company: slide.querySelector('.company-name').textContent,
        location: slide.querySelector('.location').textContent,
        salary: slide.querySelector('.salary').textContent,
        workFormat: slide.querySelector('.format').textContent,
        description: slide.querySelector('.description').textContent,
        requiredSkills: Array.from(slide.querySelectorAll('.required-skills-item div')).map(el => el.textContent)
      };

      // Оновлюємо картку у DOM
      slide.querySelector('.position').textContent = updatedData.title;
      slide.querySelector('.company-name').textContent = updatedData.company;
      slide.querySelector('.location').textContent = updatedData.location;
      slide.querySelector('.salary').textContent = updatedData.salary;
      slide.querySelector('.format').textContent = updatedData.workFormat;
      slide.querySelector('.description').textContent = updatedData.description;
      const skillsList = slide.querySelector('.required-skills-list');
      skillsList.innerHTML = skills.map(s => `
        <div class="required-skills-item">
          <img src="assets/img/ellipse-grey.svg" alt="item">
          <div>${s}</div>
        </div>
      `).join('') || '&nbsp;';

      saveSlides();

      // Відправка змін на сервер
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await fetch(`http://localhost:8080/api/jobs/${slideId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Content-Type": "application/json; charset=UTF-8",
            "Accept": "application/json; charset=UTF-8",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error ${response.status}: ${errorText}`);
        }

        const newSlideData = await response.json();
        console.log("✅ Application updated:", newSlideData);

      } catch (err) {
        // --- Відкат DOM до старих значень при помилці від сервера ---
        slide.querySelector('.position').textContent = oldData.title;
        slide.querySelector('.company-name').textContent = oldData.company;
        slide.querySelector('.location').textContent = oldData.location;
        slide.querySelector('.salary').textContent = oldData.salary;
        slide.querySelector('.format').textContent = oldData.workFormat;
        slide.querySelector('.description').textContent = oldData.description;
        const skillsList = slide.querySelector('.required-skills-list');
        skillsList.innerHTML = oldData.requiredSkills.map(s => `
          <div class="required-skills-item">
            <img src="assets/img/ellipse-grey.svg" alt="item">
            <div>${s}</div>
          </div>
        `).join('') || '&nbsp;';
        console.error("❌ Помилка оновлення даних картки:", err);
        alert("Помилка мережі: " + err);
      }

      modalCard.style.display = 'none';
    });

    // --- Видалення картки ---
    deleteJobBtn.addEventListener('click', async () => {
      const index = jobForm.dataset.editingSlide;
      const slide = swiperWrapper.children[index];
      if (!slide) return;
      if (!confirm("Ви дійсно хочете видалити картку?")) return;
      const slideId = slide.dataset.slideId; // беремо id із картки

      slide.remove();
      saveSlides();

      try {
        const token = localStorage.getItem("jwtToken");
        const response = await fetch(`http://localhost:8080/api/jobs/${slideId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          },
        });

        if (response.status === 204) {
          alert(`Картку успішно видалено.`);
          console.log(`✅ Card ${slideId} successfully deleted.`);
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error ${response.status}: ${errorText}`);
        }

      } catch (err) {
        console.error("❌ Error deleting card:", err);
        alert("Помилка мережі: " + err.message);
      }

      modalCard.style.display = 'none';
    });

    // Закриття модалки
    closeModal.addEventListener('click', () => modalCard.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modalCard) modalCard.style.display = 'none'; });
  }
}
