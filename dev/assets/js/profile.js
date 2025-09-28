// Отримуємо дані з localStorage або створюємо пустий об'єкт
let profileData = JSON.parse(localStorage.getItem("profileData")) || {
   basicData: { sername: "Максим Коваленко", profession: "Senior Frontend Developer", location: "Київ, Україна", foto: "" },
   wishToVacancy: { 
       title: "Senior Frontend Developer", 
       employmentType: ["Повна зайнятість"], 
       location: "Київ", 
       workFormat: ["Офіс"], 
       experience: ["3 - 5 років"] 
   },
   accountSettings: { email: "", password: "", language: "" }
 };
 
 // Функція для рендеру профілю
 function renderProfile() {
   // basic-data
   const basic = document.querySelector(".basic-data");
   if (basic) {
     basic.querySelector(".sername").textContent = profileData.basicData.sername;
     basic.querySelector(".profession").textContent = profileData.basicData.profession;
     basic.querySelector(".location").textContent = profileData.basicData.location;
     const img = basic.querySelector(".foto img");
     if (profileData.basicData.foto) img.src = profileData.basicData.foto;
   }
 
   // wish-to-vacancy
   const wish = document.querySelector(".wish-to-vacancy");
   if (wish) {
     const w = profileData.wishToVacancy;
     wish.querySelectorAll(".job-details-group").forEach(group => {
       const field = group.dataset.field;
       const choices = group.querySelector(".job-details-choices");
       choices.innerHTML = "";
       if (Array.isArray(w[field])) {
         w[field].forEach(val => {
           const div = document.createElement("div");
           div.className = "job-details-choice";
           div.textContent = val;
           choices.appendChild(div);
         });
       } else {
         const div = document.createElement("div");
         div.className = "job-details-choice";
         div.textContent = w[field];
         choices.appendChild(div);
       }
     });
   }
 
   // account-settings
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
 
 // Логіка редагування для всіх секцій
 document.querySelectorAll(".section").forEach(section => {
   const editBtn = section.querySelector(".edit-btn");
   const form = section.querySelector(".edit-form");
   let displayBlock;
 
   if (section.classList.contains("basic-data")) displayBlock = section.querySelector(".personal-data, .resume");
   else if (section.classList.contains("wish-to-vacancy")) displayBlock = section.querySelector(".job-details");
   else if (section.classList.contains("account-settings")) displayBlock = section.querySelector(".account-settings-list");
 
   if (!form || !displayBlock) return;
 
   // на старті сховаємо форму
   form.classList.remove("active");
   displayBlock.style.display = "flex";
 
   if (editBtn) {
      editBtn.addEventListener("click", () => {
        const isActive = section.classList.contains("active");
    
        if (isActive) {
          // Вихід з режиму редагування
          form.classList.remove("active");
          displayBlock.style.display = "flex";
          section.classList.remove("editing", "active");
        } else {
          // Вхід у режим редагування
          form.classList.add("active");
          displayBlock.style.display = "none";
          section.classList.add("editing", "active");
    
          // Заповнюємо форму даними
          if (section.classList.contains("basic-data")) {
            form.sername.value = profileData.basicData.sername;
            form.profession.value = profileData.basicData.profession;
            form.location.value = profileData.basicData.location;
            form.foto.value = profileData.basicData.foto;
          }
    
          if (section.classList.contains("wish-to-vacancy")) {
            const w = profileData.wishToVacancy;
            form.title.value = w.title;
            form.employmentType.value = w.employmentType.join(", ");
            form.location.value = w.location;
            form.workFormat.value = w.workFormat.join(", ");
            form.experience.value = w.experience.join(", ");
          }
    
          if (section.classList.contains("account-settings")) {
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
      });
   }
 
   form.addEventListener("submit", e => {
     e.preventDefault();
 
     if (section.classList.contains("basic-data")) {
       profileData.basicData.sername = form.sername.value;
       profileData.basicData.profession = form.profession.value;
       profileData.basicData.location = form.location.value;
       profileData.basicData.foto = form.foto.value;
     }
     if (section.classList.contains("wish-to-vacancy")) {
       profileData.wishToVacancy.title = form.title.value;
       profileData.wishToVacancy.employmentType = form.employmentType.value.split(",").map(s => s.trim());
       profileData.wishToVacancy.location = form.location.value;
       profileData.wishToVacancy.workFormat = form.workFormat.value.split(",").map(s => s.trim());
       profileData.wishToVacancy.experience = form.experience.value.split(",").map(s => s.trim());
     }
     if (section.classList.contains("account-settings")) {
       profileData.accountSettings.email = form.email.value;
       profileData.accountSettings.password = form.password.value;
       profileData.accountSettings.language = form.language.value;
     }
 
     localStorage.setItem("profileData", JSON.stringify(profileData));
 
      form.classList.remove("active");
      displayBlock.style.display = "flex";
      section.classList.remove("editing");
      renderProfile();
   });
});
 