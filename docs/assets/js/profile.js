// Отримуємо дані з localStorage або створюємо пустий об'єкт
let profileData = JSON.parse(localStorage.getItem("profileData")) || {
  basicData: {
    sername: "Максим Коваленко",
    profession: "Senior Frontend Developer",
    location: "Київ, Україна",
    foto: "",
    resumeName: "",
    resumeUrl: ""
  },
  wishToVacancy: {
    title: "Senior Frontend Developer",
    employmentType: ["Повна зайнятість"],
    location: "Київ",
    workFormat: ["Офісний"],
    experience: ["3 - 5 років"]
  },
  accountSettings: {
    email: "",
    password: "",
    language: "Українська"
  }
};

// Підставляємо email/password із localStorage, якщо вони є
if (localStorage.getItem("userEmail")) profileData.accountSettings.email = localStorage.getItem("userEmail");
if (localStorage.getItem("userPassword")) profileData.accountSettings.password = localStorage.getItem("userPassword");

// ====================== Функція рендеру профілю ======================
function renderProfile() {
  // --- basic-client-data ---
  const basic = document.querySelector(".basic-client-data");
  if (basic) {
    basic.querySelector(".sername").textContent = profileData.basicData.sername;
    basic.querySelector(".profession").textContent = profileData.basicData.profession;
    basic.querySelector(".location").textContent = profileData.basicData.location;

    const img = basic.querySelector(".foto img");
    img.src = profileData.basicData.foto || 'assets/img/person-100-grey.svg';

    const resumeDiv = basic.querySelector(".upload-resume");
    if (profileData.basicData.resumeName) {
      resumeDiv.innerHTML = `<a href="${profileData.basicData.resumeUrl}" download>${profileData.basicData.resumeName}</a>`;
    } else {
      resumeDiv.textContent = "Завантаж своє резюме";
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
    settings[0].textContent = profileData.accountSettings.email || "Електронна пошта";
    settings[1].textContent = profileData.accountSettings.password ? "**********" : "Пароль";
    settings[2].textContent = profileData.accountSettings.language || "Мова";
  }
}

// Викликаємо рендер на старті
renderProfile();

// ====================== Логіка редагування секцій ======================
document.querySelectorAll(".section").forEach(section => {
  const editBtn = section.querySelector(".edit-btn");
  const form = section.querySelector(".edit-form");
  let displayBlock;

  if (section.classList.contains("basic-client-data")) displayBlock = section.querySelector(".personal-data");
  else if (section.classList.contains("wish-to-vacancy")) displayBlock = section.querySelector(".job-details");
  else if (section.classList.contains("account-settings")) displayBlock = section.querySelector(".account-settings-list");

  if (!form || !displayBlock) return;

  // сховаємо форму на старті
  form.classList.remove("active");
  displayBlock.style.display = "flex";

  const resumeBlock = section.querySelector(".resume"); // для basic-client-data

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
          form.location.value = w.location;
          form.workFormat.value = w.workFormat.join(", ");
          form.experience.value = w.experience.join(", ");
        } else if (section.classList.contains("account-settings")) {
          const a = profileData.accountSettings;
          form.email.value = a.email;       // показуємо email
          form.password.value = a.password; // показуємо реальний пароль
          form.language.value = a.language;
          form.email.disabled = true;
          form.password.disabled = true;
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
      profileData.wishToVacancy.location = form.location.value;
      profileData.wishToVacancy.workFormat = form.workFormat.value.split(",").map(s => s.trim());
      profileData.wishToVacancy.experience = form.experience.value.split(",").map(s => s.trim());
    } else if (section.classList.contains("account-settings")) {
      profileData.accountSettings.email = form.email.value;
      profileData.accountSettings.password = form.password.value;
      profileData.accountSettings.language = form.language.value;
    }

    localStorage.setItem("profileData", JSON.stringify(profileData));
    form.classList.remove("active");
    displayBlock.style.display = "flex";
    section.classList.remove("editing");
    renderProfile();

    // --- Відновлюємо видимість .resume після submit ---
    if (section.classList.contains("basic-client-data") && resumeBlock) {
      resumeBlock.style.display = "flex";
    }
  });
});

// ====================== Завантаження резюме ======================
if (window.location.pathname.endsWith("profile.html")) {
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
    formData.append("userId", 1); // TODO: Замінити на реальний ID користувача
  
    try {
      const token = localStorage.getItem("jwtToken");
  
      const response = await fetch("http://localhost:8080/api/resumes/upload", {
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
  
      // Зберігаємо в localStorage метадані
      localStorage.setItem("profileData", JSON.stringify(profileData));
  
      // Відображаємо резюме
      resumeStatus.textContent = "✅ Резюме успішно завантажено!";
      resumeStatus.style.color = "green";
      uploadedResume.innerHTML = `<a href="${profileData.basicData.resumeUrl}" target="_blank">${profileData.basicData.resumeName}</a>`;

    } catch (error) {
      console.error("Resume upload failed:", error);
      resumeStatus.textContent = "❌ Сервер недоступний або мережа не працює";
      resumeStatus.style.color = "#DE1B1B";
    }
  });
}
