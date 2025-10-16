export function modalAddVacation(cardsSwiper, saveSlides) {
  const openModal = document.getElementById('openModal');
  const closeModalAdd = document.getElementById('closeModalAdd');
  const modalCard = document.getElementById('jobModal');
  const jobForm = document.getElementById('jobForm');
  const formatInput = jobForm.querySelector('#format');
  const formatButtons = jobForm.querySelectorAll('.format-buttons button');
  const swiperWrapper = document.querySelector('.swiper-wrapper');
  const submitBtn = jobForm.querySelector('.btn.btn-primary');
  if (submitBtn) submitBtn.disabled = true;

  // --- Функція перевірки заповнення перших 5 полів ---
  function checkFormValidity() {
    const mainFields = [
      jobForm.querySelector('#position'),
      jobForm.querySelector('#company'),
      jobForm.querySelector('#location'),
      jobForm.querySelector('#salary'),
      jobForm.querySelector('#format')
    ];

    const allFilled = mainFields.every(field => (field.value || '').trim() !== '');
    submitBtn.disabled = !allFilled;
  }

  // --- Слухачі на кнопки формату, бо value ставиться програмно ---
  formatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const activeValues = Array.from(formatButtons)
        .filter(b => b.classList.contains('active'))
        .map(b => b.dataset.value);
      formatInput.value = activeValues.join(', ');
      checkFormValidity();
    });
  });

  // --- Слухачі на поля (input + формат роботи) ---
  const mainInputs = jobForm.querySelectorAll('#position, #company, #location, #salary, #format');
  mainInputs.forEach(input => input.addEventListener('input', checkFormValidity));

  // --- Відкрити модалку ---
  openModal.addEventListener('click', () => {
    modalCard.style.display = 'block';
    jobForm.reset();

    // Скидаємо формат роботи
    formatButtons.forEach(b => b.classList.remove('active'));
    formatInput.value = '';
    submitBtn.disabled = true;

    const firstField = jobForm.querySelector('input, textarea');
    if (firstField) firstField.focus();
  });

  // --- Закрити модалку ---
  closeModalAdd.addEventListener('click', () => modalCard.style.display = 'none');
  window.addEventListener('click', e => { if (e.target === modalCard) modalCard.style.display = 'none'; });

  // --- Сабміт форми ---
  jobForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(jobForm);
    const data = Object.fromEntries(formData.entries());

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
      const token = localStorage.getItem("jwtToken");
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
              <div class="item company">${data.company}</div>
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
          <button class="btn btn-primary">В трекер</button>
        </div>
      `;

      // Додаємо картку на початок слайдера
      swiperWrapper.insertBefore(newSlide, swiperWrapper.firstChild);

      // Оновлюємо Swiper
      if (cardsSwiper) {
        cardsSwiper.update();
        cardsSwiper.slideTo(0);
      }

      saveSlides();

      // Закриваємо модалку і чистимо форму
      modalCard.style.display = 'none';
      jobForm.reset();
      formatButtons.forEach(b => b.classList.remove('active'));
      formatInput.value = '';
      submitBtn.disabled = true;
      alert("Вакансію додано на сервер та локально!");
    } catch (err) {
      alert("Помилка мережі: " + err);
    }
  });
}
