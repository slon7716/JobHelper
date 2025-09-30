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
    workFormat: ["Офіснийний"],
    experience: ["3 - 5 років"]
  },
  accountSettings: {
    email: "",
    password: "",
    language: ""
  }
};

// ====================== Функція рендеру профілю ======================
function renderProfile() {
  // --- basic-data ---
  const basic = document.querySelector(".basic-data");
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
    const settings = account.querySelectorAll(".account-setting");
    if (settings.length >= 4) {
      settings[0].textContent = profileData.accountSettings.email || "Змінити імейл";
      settings[1].textContent = profileData.accountSettings.password ? "*****" : "Змінити пароль";
      settings[2].textContent = profileData.accountSettings.language || "Змінити мову";
      settings[3].textContent = "Видалити акаунт";
    }
  }
}

// Викликаємо рендер на старті
renderProfile();

// ====================== Логіка редагування секцій ======================
document.querySelectorAll(".section").forEach(section => {
  const editBtn = section.querySelector(".edit-btn");
  const form = section.querySelector(".edit-form");
  let displayBlock;

  if (section.classList.contains("basic-data")) displayBlock = section.querySelector(".personal-data");
  else if (section.classList.contains("wish-to-vacancy")) displayBlock = section.querySelector(".job-details");
  else if (section.classList.contains("account-settings")) displayBlock = section.querySelector(".account-settings-list");

  if (!form || !displayBlock) return;

  // сховаємо форму на старті
  form.classList.remove("active");
  displayBlock.style.display = "flex";

  const resumeBlock = section.querySelector(".resume"); // для basic-data

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
        if (section.classList.contains("basic-data")) {
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
          form.email.value = a.email;
          form.password.value = a.password;
          form.language.value = a.language;
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

    if (section.classList.contains("basic-data")) {
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
    if (section.classList.contains("basic-data") && resumeBlock) {
      resumeBlock.style.display = "flex";
    }
  });
});
