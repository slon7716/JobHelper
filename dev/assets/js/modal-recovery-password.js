const modal = document.getElementById('forgotPasswordModal');

if (modal) {
  // ---------------------------
  // MOCK fetch для локального тестування (успішна відповідь)
  // Видали або закоментуй цей блок, коли підключиш реальний сервер.
  // ---------------------------
  // window.fetch = async function (url, options) {
  //   console.log("Mock fetch called:", url, options);
  //   return {
  //     ok: true,
  //     status: 200,
  //     json: async () => ({ message: "Success" })
  //   };
  // };
  // ---------------------------
  const steps = {
    email: modal.querySelector('.step-email'),
    code: modal.querySelector('.step-code'),
    newPassword: modal.querySelector('.step-new-password'),
    success: modal.querySelector('.step-success-message')
  };
  
  // --- Відкриття/Закриття модалки ---
  const openBtn = document.querySelector('.forgot-password');
  const closeBtns = document.querySelectorAll('.modal-close');
  openBtn.addEventListener('click', e => {
    e.preventDefault();
    modal.style.display = 'flex';
    showStep('email');
  });
  closeBtns.forEach(btn => btn.addEventListener('click', () => modal.style.display = 'none'));
  window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
  
  // --- Перемикання кроків модалки ---
  function showStep(stepName) {
    Object.values(steps).forEach(s => s.classList.remove('active'));
    if (steps[stepName]) steps[stepName].classList.add('active');
  }

  // ==========================
  // --- Email крок ---
  // ==========================
  const emailInput = steps.email.querySelector('#resetEmail');
  const submitBtn = steps.email.querySelector('.btn-primary');

  // Активація кнопки при валідному email
  emailInput.addEventListener('input', () => {
    const value = emailInput.value.trim();
    if (value.length > 0 && emailInput.checkValidity()) {
      submitBtn.disabled = false;
      emailInput.classList.remove('error');
    } else {
      submitBtn.disabled = true;
      if (value.length > 0) emailInput.classList.add('error');
      else emailInput.classList.remove('error');
    }
  });

  // --- Відправка запиту на сервер ---
  const emailForm = steps.email.querySelector('.modal-form');
  emailForm.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.value })
      });
  
      if (response.ok) {
        showStep('code');
        const codeText = steps.code.querySelector('.modal-header p');
        codeText.textContent = `Ми надіслали код на ${emailInput.value}. Введіть його нижче, щоб підтвердити вашу особу.`;
      } else {
        // const result = await response.json();
        alert(result.message || "❌ Не вдалося надіслати код. Перевірте email і спробуйте ще раз.");
      }
    } catch (error) {
      console.error("Помилка:", error);
      alert("⚠️ Сервер недоступний.");
    }
  });

  // ==========================
  // --- Повторна відправка коду підтвердження ---
  // ==========================
  const resendLink = document.getElementById('resendCode');
  resendLink.addEventListener('click', async e => {
    e.preventDefault();
    confirmationInput.value = '';
    resendLink.classList.add('resend-animate');
    setTimeout(() => resendLink.classList.remove('resend-animate'), 900);

    try {
      const response = await fetch("http://localhost:8080/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.value })
      });

      if (response.ok) {
        const codeText = steps.code.querySelector('.modal-header p');
        codeText.textContent = `Код повторно надіслано на ${emailInput.value}. Перевірте пошту.`;
      } else {
        alert("❌ Не вдалося повторно надіслати код.");
      }
    } catch (err) {
      console.error("Помилка при повторній відправці коду:", err);
      alert("⚠️ Сервер недоступний. Спробуйте пізніше.");
    }
  });
  
  // ==========================
  // --- Код підтвердження ---
  // ==========================
  const codeForm = steps.code.querySelector('.modal-form');
  const confirmationInput = steps.code.querySelector('#confirmationCode');
  
  codeForm.addEventListener('submit', async e => {
    e.preventDefault();
    
    const code = confirmationInput.value.trim();
    if (!code) {
      alert("❌ Введіть код підтвердження");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:8080/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code })
      });
  
      if (response.ok) {
        showStep('newPassword');
      } else if (response.status === 400) {
        alert("❌ Код неправильний або застарів. Спробуйте ще раз.");
      } else {
        alert("⚠️ Помилка при перевірці коду. Спробуйте пізніше.");
      }
    } catch (err) {
      console.error("Помилка при перевірці коду:", err);
      alert("⚠️ Сервер недоступний.");
    }

    showStep('newPassword');
  });
  
  // ==========================
  // --- Новий пароль ---
  // ==========================
  const newPasswordInput = steps.newPassword.querySelector('#newPassword');
  const confirmPasswordInput = steps.newPassword.querySelector('#confirmPassword');
  const saveBtn = steps.newPassword.querySelector('.btn-primary');
  const warningBlock = steps.newPassword.querySelector('.info-lock');

  const isPasswordValidModal = password => /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%]).{8,20}$/.test(password);

  // Перевірка валідності пароля
  function checkPasswords() {
    const value = newPasswordInput.value.trim();
    const confirmValue = confirmPasswordInput.value.trim();
    const valid = isPasswordValidModal(value);

    if (value.length > 0 && !valid) {
      newPasswordInput.classList.add('error');
      warningBlock.style.display = 'block';
    } else {
      newPasswordInput.classList.remove('error');
      warningBlock.style.display = 'none';
    }

    saveBtn.disabled = !(valid && confirmValue.length > 0);
  }

  newPasswordInput.addEventListener('input', checkPasswords);
  confirmPasswordInput.addEventListener('input', checkPasswords);

  steps.newPassword.querySelector('.modal-form').addEventListener('submit', async e => {
    e.preventDefault();

    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const token = confirmationInput.value.trim(); // код із попереднього кроку
    const errorMessage = steps.newPassword.querySelector('.error-message');

    if (newPassword !== confirmPassword) {
      errorMessage.textContent = "Паролі не співпадають";
      errorMessage.style.display = "block";
      return;
    } else {
      errorMessage.textContent = "";
      errorMessage.style.display = "none";
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });

      if (response.ok) {
        // Оновлюємо пароль у localStorage
        localStorage.setItem("userPassword", newPassword);
        // Оновлюємо пароль у profileData
        let profileData = JSON.parse(localStorage.getItem("profileData"));
        if (profileData && profileData.accountSettings) {
          profileData.accountSettings.password = newPassword;
          localStorage.setItem("profileData", JSON.stringify(profileData));
        }
      
        showStep('success');
      } else {
        alert("❌ Не вдалося змінити пароль. Можливо, код неправильний або застарів.");
      }
      
    } catch (err) {
      console.error("Помилка при зміні пароля:", err);
      alert("⚠️ Сервер недоступний.");
    }
  });
}
