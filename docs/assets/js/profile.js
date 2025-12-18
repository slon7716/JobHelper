const profilePage = document.querySelector('.profile')

if (profilePage) {
  // Отримуємо дані з localStorage або створюємо пустий об'єкт
  let profileData = JSON.parse(localStorage.getItem("profileData")) || {
    basicData: {
      sername: "",
      profession: "",
      location: "",
      foto: "",
      resumeName: "",
      resumeUrl: "",
      resumeId: null
    },
    wishToVacancy: {
      title: "",
      location: "",
      workFormat: [""],
      employmentType: [""],
      experience: [""]
    },
    accountSettings: {
      email: "@mail",
      language: "Українська"
    }
  };

  // Підставляємо email із localStorage
  if (localStorage.getItem("userEmail")) profileData.accountSettings.email = localStorage.getItem("userEmail");

  // ====================== Функція рендеру профілю ======================
  function renderProfile() {
    // --- basic-client-data ---
    const basic = document.querySelector(".basic-client-data");
    if (basic) {
      const sernameEl = basic.querySelector(".sername");
      if (profileData.basicData.sername) sernameEl.textContent = profileData.basicData.sername;

      const professionEl = basic.querySelector(".profession");
      if (profileData.basicData.profession) professionEl.textContent = profileData.basicData.profession;

      const locationEl = basic.querySelector(".location");
      if (profileData.basicData.location) locationEl.textContent = profileData.basicData.location;

      const img = basic.querySelector(".foto img");
      img.src = profileData.basicData.foto || 'assets/img/person-100-grey.svg';

      const resumeDiv = basic.querySelector(".upload-resume");
      if (profileData.basicData.resumeName) {
        resumeDiv.innerHTML = `<a href="${profileData.basicData.resumeUrl}" download>${profileData.basicData.resumeName}</a>`;
      } else {
        resumeDiv.textContent = "Завантаж своє резюме";
      }
      // --- ATS-оцінка резюме ---
      if (profileData.basicData.resumeId) {
        loadATSEvaluation(profileData.basicData.resumeId);
      } else {
        const atsElement = document.getElementById('evaluateResume');
        if (atsElement) atsElement.textContent = '—';
      }
    }

    // --- wish-to-vacancy ---
    const wish = document.querySelector(".wish-to-vacancy");
    if (wish) {
      const w = profileData.wishToVacancy;
      wish.querySelectorAll(".job-details-group").forEach(group => {
        const field = group.dataset.field;
        const choices = group.querySelector(".job-details-choices");
        choices.innerHTML = "";
        const values = Array.isArray(w[field]) ? w[field] : [w[field]];
        values.forEach(val => {
          const div = document.createElement("div");
          div.className = "job-details-choice";
          div.textContent = val;
          choices.appendChild(div);
        });
      });
    }

    // --- account-settings ---
    const account = document.querySelector(".account-settings-list");
    if (account) {
      const settings = account.querySelectorAll(".account-setting-choice");
      settings[0].textContent = profileData.accountSettings.email || "@ email";
      settings[1].textContent = profileData.accountSettings.language || "Мова";
    }
  }
  // Викликаємо рендер на старті
  renderProfile();

  // ====================== Редагування секцій ======================
  document.querySelectorAll(".section").forEach(section => {
    const editBtn = section.querySelector(".edit-btn");
    const form = section.querySelector(".edit-form");
    let displayBlock;

    if (section.classList.contains("basic-client-data")) displayBlock = section.querySelector(".personal-data");
    else if (section.classList.contains("wish-to-vacancy")) displayBlock = section.querySelector(".job-details");
    else if (section.classList.contains("account-settings")) displayBlock = section.querySelector(".account-settings-list");

    if (!form || !displayBlock) return;

    // ховаємо форму на старті
    form.classList.remove("active");
    displayBlock.style.display = "flex";

    const resumeBlock = section.querySelector(".resume");

    if (editBtn) {
      editBtn.addEventListener("click", () => {
        const isActive = section.classList.contains("active");

        if (isActive) {
          // Вихід з редагування
          form.classList.remove("active");
          displayBlock.style.display = "flex";
          section.classList.remove("editing", "active");
          if (resumeBlock) resumeBlock.style.display = "flex";
        } else {
          // Вхід у редагування
          form.classList.add("active");
          displayBlock.style.display = "none";
          section.classList.add("editing", "active");
          if (resumeBlock) resumeBlock.style.display = "none";

          // Заповнюємо форму даними
          if (section.classList.contains("basic-client-data")) {
            form.sername.value = profileData.basicData.sername;
            form.profession.value = profileData.basicData.profession;
            form.location.value = profileData.basicData.location;
            form.foto.value = profileData.basicData.foto;
          } else if (section.classList.contains("wish-to-vacancy")) {
            const w = profileData.wishToVacancy;
            form.title.value = w.title;
            form.employmentType.value = w.employmentType.join(", ");
            form.location.value = w.location.join(", ");
            form.workFormat.value = w.workFormat.join(", ");
            form.experience.value = w.experience;
          } else if (section.classList.contains("account-settings")) {
            const a = profileData.accountSettings;
            form.email.value = a.email;
            form.language.value = a.language;
            form.email.disabled = true;
            form.language.disabled = true;
          }
        }
      });
    }

    const cancelBtn = section.querySelector(".cancel-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        form.classList.remove("active");
        displayBlock.style.display = "flex";
        section.classList.remove("editing");
        if (resumeBlock) resumeBlock.style.display = "flex";
      });
    }

    form.addEventListener("submit", e => {
      e.preventDefault();

      if (section.classList.contains("basic-client-data")) {
        profileData.basicData.sername = form.sername.value;
        profileData.basicData.profession = form.profession.value;
        profileData.basicData.location = form.location.value;
        profileData.basicData.foto = form.foto.value;
      } else if (section.classList.contains("wish-to-vacancy")) {
        profileData.wishToVacancy.title = form.title.value;
        profileData.wishToVacancy.employmentType = form.employmentType.value.split(",").map(s => s.trim());
        profileData.wishToVacancy.location = form.location.value.split(",").map(s => s.trim());
        profileData.wishToVacancy.workFormat = form.workFormat.value.split(",").map(s => s.trim());
        profileData.wishToVacancy.experience = form.experience.value;
      } else if (section.classList.contains("account-settings")) {
        profileData.accountSettings.email = form.email.value;
        profileData.accountSettings.language = form.language.value;
      }

      localStorage.setItem("profileData", JSON.stringify(profileData));
      form.classList.remove("active");
      displayBlock.style.display = "flex";
      section.classList.remove("editing");
      renderProfile();

      // Відновлюємо видимість назви резюме після змін
      if (section.classList.contains("basic-client-data") && resumeBlock) {
        resumeBlock.style.display = "flex";
      }
    });
  });

  // ====================== ATS-оцінка резюме ======================
  async function loadATSEvaluation(resumeId) {
    const atsElement = document.getElementById('evaluateResume');
    if (!atsElement) return;

    try {
      const token = localStorage.getItem("jwtToken");
      const response = await fetch(`${API_URL}/api/ats-evaluation/resume/${resumeId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error(`Помилка ${response.status}`);

      const data = await response.json();
      const atsScore = typeof data === 'number' ? data : data.score;

      const scoreValue = (atsScore != null && !isNaN(atsScore)) ? atsScore : "---";
      atsElement.textContent = `${scoreValue}%`;

    } catch (err) {
      console.error('Помилка при завантаженні ATS-оцінки:', err);
      atsElement.textContent = '---';
    }
  }

  // ====================== ЗАВАНТАЖЕННЯ РЕЗЮМЕ ======================
  const resumeInput = document.getElementById("resumeFile");
  const resumeStatus = document.getElementById("resumeStatus");
  const uploadedResume = document.getElementById("uploadedResume");
  const uploadBtn = document.getElementById("uploadBtn");

  // Клік по кнопці відкриває файловий діалог
  uploadBtn.addEventListener("click", () => resumeInput.click());

  resumeInput.addEventListener("change", async function () {
    if (resumeInput.files.length === 0) return;

    const file = resumeInput.files[0];
    const allowedTypes = [ // Перевірка MIME-типу
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    // Перевірка розширення на випадок, якщо браузер не визначив MIME
    const allowedExtensions = ["pdf", "docx"];
    const fileExt = file.name.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
      resumeStatus.textContent = "❌ Будь ласка, завантажте файл у форматі PDF або DOCX";
      resumeStatus.style.color = "#DE1B1B";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", 1); // Замінити на реальний ID користувача

    try {
      const token = localStorage.getItem("jwtToken");

      const response = await fetch(`${API_URL}/api/resumes/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      // Тут обробляємо помилки HTTP
      if (!response.ok) {
        const errorText = await response.text();
        console.log(errorText);
        resumeStatus.textContent = "❌ Не вдалося завантажити резюме. Спробуйте ще раз.";
        resumeStatus.style.color = "#DE1B1B";
        return;
      }

      // Очікуємо JSON від сервера із посиланням на файл
      const result = await response.json();

      // Перевіряємо, чи сервер повернув посилання на завантажений файл
      if (!result.fileUrl) {
        resumeStatus.textContent = "❌ Сервер не повернув посилання на файл";
        resumeStatus.style.color = "#DE1B1B";
        return;
      }

      // Оновлюємо profileData
      profileData.basicData.resumeName = file.name;
      profileData.basicData.resumeUrl = result.fileUrl;
      profileData.basicData.resumeId = result.resumeId;

      // Зберігаємо в localStorage метадані
      localStorage.setItem("profileData", JSON.stringify(profileData));

      // Відображаємо повідомлення
      resumeStatus.textContent = "✅ Резюме успішно завантажено!";
      resumeStatus.style.color = "green";

      // Відображаємо назву резюме як посилання
      uploadedResume.innerHTML = `<span class="resume-link">${file.name}</span>`;
      addResumeClickHandler(profileData.basicData.resumeId);

      // Завантажуємо ATS-оцінку
      loadATSEvaluation(result.resumeId);
      renderProfile();

    } catch (error) {
      console.error("Resume upload failed:", error);
      resumeStatus.textContent = "❌ Сервер недоступний або мережа не працює";
      resumeStatus.style.color = "#DE1B1B";
    }
  });

  // ====================== ВІДКРИТТЯ РЕЗЮМЕ ======================
  if (profileData?.basicData?.resumeName) {
    uploadedResume.innerHTML = `<span class="resume-link">${profileData.basicData.resumeName}</span>`;
    addResumeClickHandler(profileData.basicData.resumeId);
  }
  function addResumeClickHandler(resumeId) {
    const token = localStorage.getItem("jwtToken");
    uploadedResume.addEventListener("click", async () => {
      try {
        const response = await fetch(`${API_URL}/api/resumes/${resumeId}/file`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
          alert("Не вдалося завантажити файл з сервера");
          return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      } catch (err) {
        console.error("Помилка при завантаженні:", err);
        alert("Сервер недоступний або сталася помилка мережі");
      }
    });
  }

  // ====================== ВИЙТИ З АККАУНТУ ======================
  const logoutBtn = document.getElementById('logoutBtn');
  const modalLogout = document.getElementById('logoutModal');
  const confirmLogout = document.getElementById('confirmLogout');
  const cancelLogout = document.getElementById('cancelLogout');

  if (logoutBtn && modalLogout) { // показати модалку
    logoutBtn.addEventListener('click', () => {
      modalLogout.style.display = 'flex';
    });
    // натиснули "скасувати"
    cancelLogout.addEventListener('click', () => {
      modalLogout.style.display = 'none';
    });
    // натиснули "так"
    confirmLogout.addEventListener('click', () => {
      window.location.href = 'index.html'; // редирект сторінку lending
    });
    // закриття по кліку поза модалкою
    modalLogout.addEventListener('click', (e) => {
      if (e.target === modalLogout) {
        modalLogout.style.display = 'none';
      }
    });
  }
}