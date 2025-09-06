const modal = document.getElementById('forgotPasswordModal');
const openBtn = document.querySelector('.forgot-password');
const closeBtns = document.querySelectorAll('.modal-close');

if (modal && openBtn && closeBtns.length) {
   const stepEmail = modal.querySelector('.step-email');
   const stepCode = modal.querySelector('.step-code');
   const stepNewPassword = modal.querySelector('.step-new-password');

   const emailInput = document.getElementById('resetEmail');
   const submitBtn = stepEmail.querySelector('.btn-primary');
   const emailForm = stepEmail.querySelector('.modal-form');
   const resendLink = document.getElementById('resendCode');
   const codeText = stepCode.querySelector('.modal-header p');
   const codeForm = stepCode.querySelector('.modal-form');

   // Відкриття модалки
   openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.style.display = 'flex';
      showStep('email');
   });

   // Закриття модалки
   closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
         modal.style.display = 'none';
      });
   });

   // Закриття при кліку поза модалкою
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
               // анімація
      resendLink.classList.add('resend-animate');
      setTimeout(() => {
         resendLink.classList.remove('resend-animate');
      }, 900); // тривалість анімації в мс
   });

   // Після підтвердження коду
   codeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showStep('new-password');
   });

   // --- Валідація нового пароля ---
   const newPasswordInput = modal.querySelector('#newPassword');
   const confirmPasswordInput = modal.querySelector('#confirmPassword');
   const newPasswordForm = stepNewPassword.querySelector('.modal-form');
   const saveBtn = stepNewPassword.querySelector('.btn-primary');
   const warningBlock = stepNewPassword.querySelector('.info-lock');
   const successBlock = stepNewPassword.querySelector('.success-message');

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
      if (!saveBtn.disabled) {
         newPasswordForm.style.display = 'none';
         const header = stepNewPassword.querySelector('.modal-header');
         if (header) header.style.display = 'none';
         successBlock.style.display = 'flex';
      }
   });
}

// Функція для показу кроків
function showStep(step) {
   const stepEmail = modal.querySelector('.step-email');
   const stepCode = modal.querySelector('.step-code');
   const stepNewPassword = modal.querySelector('.step-new-password');

   stepEmail.classList.remove('active');
   stepCode.classList.remove('active');
   stepNewPassword.classList.remove('active');

   if (step === 'email') stepEmail.classList.add('active');
   if (step === 'code') stepCode.classList.add('active');
   if (step === 'new-password') stepNewPassword.classList.add('active');
}
