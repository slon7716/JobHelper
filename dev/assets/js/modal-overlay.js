const modal = document.getElementById('forgotPasswordModal');
const openBtn = document.querySelector('.forgot-password');
const closeBtns = document.querySelectorAll('.modal-close');

if (modal && openBtn && closeBtns.length) {
   // Зберігаємо кроки модалки в змінні
   const steps = {
      email: modal.querySelector('.step-email'),
      code: modal.querySelector('.step-code'),
      newPassword: modal.querySelector('.step-new-password'),
      success: modal.querySelector('.step-success-message')
   };

   const emailInput = document.getElementById('resetEmail');
   const submitBtn = steps.email.querySelector('.btn-primary');
   const emailForm = steps.email.querySelector('.modal-form');
   const resendLink = document.getElementById('resendCode');
   const codeText = steps.code.querySelector('.modal-header p');
   const codeForm = steps.code.querySelector('.modal-form');

   const newPasswordInput = steps.newPassword.querySelector('#newPassword');
   const confirmPasswordInput = steps.newPassword.querySelector('#confirmPassword');
   const newPasswordForm = steps.newPassword.querySelector('.modal-form');
   const saveBtn = steps.newPassword.querySelector('.btn-primary');
   const warningBlock = steps.newPassword.querySelector('.info-lock');

   // --- Функція показу кроку ---
   function showStep(stepName) {
      // ховаємо всі кроки
      Object.values(steps).forEach(step => step.classList.remove('active'));
      // показуємо потрібний
      if (steps[stepName]) steps[stepName].classList.add('active');
   }

   // Відкриття модалки
   openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.style.display = 'flex';
      showStep('email');
   });

   // Закриття модалки
   closeBtns.forEach(btn => {
      btn.addEventListener('click', () => modal.style.display = 'none');
   });
   window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
   });

   // Валідація email
   emailInput.addEventListener('input', () => {
      submitBtn.disabled = !emailInput.checkValidity();
   });

   // Відправка email
   emailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showStep('code');
      codeText.textContent = `Ми надіслали код на ${emailInput.value}. Введіть його нижче, щоб підтвердити вашу особу.`;
   });

   // Повторне надсилання коду
   resendLink.addEventListener('click', (e) => {
      e.preventDefault();
      codeText.textContent = `Код повторно надіслано на ${emailInput.value}. Перевірте пошту.`;
      const confirmationInput = document.getElementById('confirmationCode');
      if (confirmationInput) confirmationInput.value = '';
      resendLink.classList.add('resend-animate');
      setTimeout(() => resendLink.classList.remove('resend-animate'), 900);
   });

   // Після підтвердження коду
   codeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showStep('newPassword'); // тут ключ зі словника steps
   });

   // --- Валідація нового пароля ---
   function validatePassword(password) {
      const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%]).{8,20}$/;
      return regex.test(password);
   }

   function checkPasswords() {
      const isValid = validatePassword(newPasswordInput.value);
      const isMatch = newPasswordInput.value === confirmPasswordInput.value && confirmPasswordInput.value.trim() !== '';
      warningBlock.style.display = (!isValid && newPasswordInput.value.trim() !== '') ? 'block' : 'none';
      saveBtn.disabled = !(isValid && isMatch);
   }

   newPasswordInput.addEventListener('input', checkPasswords);
   confirmPasswordInput.addEventListener('input', checkPasswords);

   // Підтвердження нового пароля
   newPasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showStep('success');
   });
}
