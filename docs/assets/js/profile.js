import { API_URL } from './modules/config.js';
import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode/build/jwt-decode.esm.js';

const profilePage = document.querySelector('.profile')

if (profilePage) {
  // ====================== profileData ======================
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
      location: [],
      workFormat: [],
      employmentType: [],
      experience: ""
    },
    accountSettings: {
      email: "@mail",
      language: "Українська"
    }
  };

  const storedEmail = localStorage.getItem("userEmail");
  if (storedEmail) {
    profileData.accountSettings = profileData.accountSettings || {};
    profileData.accountSettings.email = storedEmail;
  }
  localStorage.setItem("profileData", JSON.stringify(profileData));
  
  // ====================== RENDER ======================
  function render() {
    renderProfile();
    renderResume();
    renderWishToVacancy();
    renderAccountSettings();
  
    const atsEl = document.getElementById('evaluateResume');
  
    if (profileData.basicData.resumeId) {
      loadATSEvaluation(profileData.basicData.resumeId);
    } else if (atsEl) {
      atsEl.textContent = '—';
    }
  }
  
  // --- PROFILE ---
  function renderProfile() {
    const basic = document.querySelector(".basic-client-data");
    if (!basic) return;
  
    const b = profileData.basicData;
    basic.querySelector(".sername").textContent = b.sername || "";
    basic.querySelector(".profession").textContent = b.profession || "";
    basic.querySelector(".location").textContent = b.location || "";
    const img = basic.querySelector(".foto img");
    if (img) img.src = b.foto || 'assets/img/person-100-grey.svg';
  }
  
  // --- RESUME ---
  function renderResume() {
    const el = document.getElementById("uploadedResume");
    if (!el) return;
  
    const name = profileData.basicData.resumeName;
  
    el.innerHTML = name
      ? `<span class="resume-link">${name}</span>`
      : `<span class="resume-empty">Завантаж своє резюме</span>`;
  }
  
  // --- ATS-оцінка ---
  async function loadATSEvaluation(resumeId) {
    const el = document.getElementById('evaluateResume');
    if (!el || !resumeId) return;
  
    try {
      const token = localStorage.getItem("jwtToken");
  
      const res = await fetch(`${API_URL}/api/ats-evaluation/resume/${resumeId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (!res.ok) throw new Error("ATS error");
  
      const data = await res.json();
      const score = data?.score ?? null;
  
      el.textContent = score != null ? `${score}%` : "---";
  
    } catch (e) {
      console.error(e);
      el.textContent = "---";
    }
  }
  
  // --- Секція "Твої побажання до вакансій" ---
  function renderWishToVacancy() {
    const wish = document.querySelector(".wish-to-vacancy");
    if (!wish) return;
  
    const w = profileData.wishToVacancy;
  
    wish.querySelectorAll(".job-details-group").forEach(group => {
      const field = group.dataset.field;
      const choices = group.querySelector(".job-details-choices");
      if (!choices) return;
  
      choices.innerHTML = "";
  
      const values = Array.isArray(w[field]) ? w[field] : [w[field]];
  
      values.forEach(val => {
        const div = document.createElement("div");
        div.className = "job-details-choice";
        div.textContent = val || "---";
        choices.appendChild(div);
      });

      if (!choices.children.length) {
        const div = document.createElement("div");
        div.className = "job-details-choice";
        div.textContent = "---";
        choices.appendChild(div);
      }
    });
  }

  // --- Секція "Налаштування акаунту" ---
  function renderAccountSettings() {
    const account = document.querySelector(".account-settings-list");
    if (!account) return;
  
    const settings = account.querySelectorAll(".account-setting-choice");
  
    if (settings[0]) {
      settings[0].textContent = profileData.accountSettings.email || "@ email";
    }
  
    if (settings[1]) {
      settings[1].textContent = profileData.accountSettings.language || "Мова";
    }
  }

  // === Завантаження резюме ===
  function initUpload() {
    const input = document.getElementById("resumeFile");
    const btn = document.getElementById("uploadBtn");
    const status = document.getElementById("resumeStatus");
  
    if (!input || !btn || !status) return;
  
    btn.addEventListener("click", () => input.click());
  
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
  
      const allowed = ["pdf", "docx"];
      const ext = file.name.split(".").pop().toLowerCase();
  
      if (!allowed.includes(ext)) {
        status.textContent = "Будь ласка, завантажте файл у форматі PDF або DOCX";
        status.style.color = "#DE1B1B";
        return;
      }
  
      try {
        const token = localStorage.getItem("jwtToken");
        const decoded = jwt_decode(token);
        const userId = decoded.userId || decoded.sub || decoded.id;

        if (!userId) {
          status.textContent = "Помилка авторизації";
          status.style.color = "#DE1B1B";
          return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", userId);

        const res = await fetch(`${API_URL}/api/resumes/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
  
        if (!res.ok) throw new Error("Upload failed");
  
        const result = await res.json();
        if (!result.fileUrl || !result.resumeId) {
          throw new Error("Bad response");
        }
  
        // ОНОВЛЕННЯ profileData
        profileData.basicData.resumeName = file.name;
        profileData.basicData.resumeUrl = result.fileUrl;
        profileData.basicData.resumeId = result.resumeId;
  
        localStorage.setItem("profileData", JSON.stringify(profileData));
  
        status.textContent = "Резюме успішно завантажено!";
        status.style.color = "green";
  
        render();
  
      } catch (e) {
        console.error(e);
        status.textContent = "Сервер недоступний або мережа не працює";
        status.style.color = "#DE1B1B";
      }
    });
  }
  
  // === Відкриття (перегляд) резюме в окремому вікні ===
  function initResumeOpen() {
    const el = document.getElementById("uploadedResume");
    if (!el) return;
  
    el.addEventListener("click", async () => {
      const resumeId = profileData.basicData.resumeId;
      if (!resumeId) return;
  
      const token = localStorage.getItem("jwtToken");
  
      try {
        const response = await fetch(`${API_URL}/api/resumes/${resumeId}/file`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        if (!response.ok) {
          alert("Не вдалося завантажити файл");
          return;
        }
  
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
  
      } catch (e) {
        console.error(e);
        alert("Помилка мережі");
      }
    });
  }

  // ====================== INIT ======================
  render();
  initResumeOpen();
  initUpload();
  
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
      render();
  
        // Відновлюємо видимість назви резюме після змін
        if (section.classList.contains("basic-client-data") && resumeBlock) {
          resumeBlock.style.display = "flex";
        }
      });
  });
  
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
