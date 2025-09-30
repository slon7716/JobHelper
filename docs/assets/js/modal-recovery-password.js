const modal = document.getElementById('forgotPasswordModal');
if (modal) {

  // ---------------------------
  // MOCK fetch для локального тестування (успішна відповідь)
  // Видали або закоментуй цей блок, коли підключиш реальний сервер.
  // ---------------------------
  // window.fetch = async function (url, options) {
  //   console.log("Mock fetch called:", url, options);
  //   // Імітуємо успішну відповідь від сервера
  //   return {
  //     ok: true,
  //     status: 200,
  //     json: async () => ({ message: "Error" })
  //   };
  // };
  // ---------------------------
  
  const steps = {
    email: modal.querySelector('.step-email'),
    code: modal.querySelector('.step-code'),
    newPassword: modal.querySelector('.step-new-password'),
    success: modal.querySelector('.step-success-message')
  };

  const openBtn = document.querySelector('.forgot-password');
  const closeBtns = document.querySelectorAll('.modal-close');

  // --- Відкриття / закриття модалки ---
  openBtn.addEventListener('click', e => {
    e.preventDefault();
    modal.style.display = 'flex';
    showStep('email');
  });

  closeBtns.forEach(btn => btn.addEventListener('click', () => modal.style.display = 'none'));
  window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

  function showStep(stepName) {
    Object.values(steps).forEach(s => s.classList.remove('active'));
    if (steps[stepName]) steps[stepName].classList.add('active');
  }

  // --- Email у модалці ---
  const emailInput = steps.email.querySelector('#resetEmail');
  const submitBtn = steps.email.querySelector('.btn-primary');

  emailInput.addEventListener('input', () => {
    const value = emailInput.value.trim();

    // Підсвічуємо помилку тільки після введення першого символу
    if (value.length > 0 && !emailInput.checkValidity()) {
      emailInput.classList.add('error');
    } else {
      emailInput.classList.remove('error');
    }

    submitBtn.disabled = !emailInput.checkValidity();
  });

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
        // --- Показуємо крок із кодом ---
        showStep('code');
        const codeText = steps.code.querySelector('.modal-header p');
        codeText.textContent = `Ми надіслали код на ${emailInput.value}. Введіть його нижче, щоб підтвердити вашу особу.`;
      } else {
        alert("❌ Не вдалося надіслати код. Перевірте email і спробуйте ще раз.");
      }
    } catch (error) {
      console.error("Помилка:", error);
      alert("⚠️ Сервер недоступний.");
    }
  });

  // --- Код підтвердження ---
  const codeForm = steps.code.querySelector('.modal-form');
  const confirmationInput = steps.code.querySelector('#confirmationCode');
  const resendLink = document.getElementById('resendCode');

  codeForm.addEventListener('submit', e => {
    e.preventDefault();
    showStep('newPassword'); // переходимо на крок "новий пароль"
  });

  resendLink.addEventListener('click', e => {
    e.preventDefault();
    const codeText = steps.code.querySelector('.modal-header p');
    codeText.textContent = `Код повторно надіслано на ${emailInput.value}. Перевірте пошту.`;

    resendLink.classList.add('resend-animate');
    setTimeout(() => resendLink.classList.remove('resend-animate'), 900);

    if (confirmationInput) confirmationInput.value = '';
  });

  // --- Новий пароль ---
  const newPasswordInput = steps.newPassword.querySelector('#newPassword');
  const confirmPasswordInput = steps.newPassword.querySelector('#confirmPassword');
  const saveBtn = steps.newPassword.querySelector('.btn-primary');
  const warningBlock = steps.newPassword.querySelector('.info-lock');

  const isPasswordValidModal = password => /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%]).{8,20}$/.test(password);

  function checkPasswords() {
    const value = newPasswordInput.value.trim();
    const confirmValue = confirmPasswordInput.value.trim();
    const valid = isPasswordValidModal(value);

    // Підсвічуємо помилку тільки після першого символу
    if (value.length > 0 && !valid) {
      newPasswordInput.classList.add('error');
      warningBlock.style.display = 'block';
    } else {
      newPasswordInput.classList.remove('error');
      warningBlock.style.display = 'none';
    }

      // Кнопка активна тільки якщо пароль валідний і confirmPassword не пустий
    saveBtn.disabled = !(valid && confirmValue.length > 0);
  }

  newPasswordInput.addEventListener('input', checkPasswords);
  confirmPasswordInput.addEventListener('input', checkPasswords);

  steps.newPassword.querySelector('.modal-form').addEventListener('submit', e => {
    e.preventDefault();
  
    const value = newPasswordInput.value.trim();
    const confirmValue = confirmPasswordInput.value.trim();
    const errorMessage = steps.newPassword.querySelector('.error-message');
  
    if (value !== confirmValue) {
      // Якщо паролі не співпадають — показуємо повідомлення
      errorMessage.textContent = "Паролі не співпадають";
      errorMessage.style.display = "block";
      return; // зупиняємо, не переходимо далі
    } else {
      // Якщо все ок — прибираємо помилку
      errorMessage.textContent = "";
      errorMessage.style.display = "none"
    }
  
    showStep('success');
  });  
}