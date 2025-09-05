const modal = document.getElementById('forgotPasswordModal');
const openBtn = document.querySelector('.forgot-password');
const closeBtns = document.querySelectorAll('.modal-close');

if (modal && openBtn && closeBtns.length) {
   const stepEmail = modal.querySelector('.step-email');
   const stepCode = modal.querySelector('.step-code');
   const emailInput = document.getElementById('resetEmail');
   const submitBtn = stepEmail.querySelector('.btn-primary');
   const emailForm = stepEmail.querySelector('.modal-form');
   const resendLink = document.getElementById('resendCode');
   const codeText = stepCode.querySelector('.modal-header p');

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
      if (e.target === modal) {
         modal.style.display = 'none';
      }
   });

   // Активуємо кнопку після валідного email
   emailInput.addEventListener('input', () => {
      submitBtn.disabled = !emailInput.checkValidity();
   });

   // Відправка форми email
   emailForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Тут можна додати запит на сервер для надсилання коду

      stepEmail.classList.remove('active');
      stepCode.classList.add('active');
      codeText.textContent = `Ми надіслали код на ${emailInput.value}. Введіть його нижче, щоб підтвердити вашу особу.`;
   });

   // Повторне надсилання коду
   resendLink.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Надсилання коду відбулося!'); // <- це буде показано у консолі
      // Тут можна повторно надіслати код на email
      codeText.textContent = `Код повторно надіслано на ${emailInput.value}. Перевірте пошту.`;

      // Опційно: можна очистити поле коду
      const confirmationInput = document.getElementById('confirmationCode');
      if (confirmationInput) confirmationInput.value = '';
   });

      // === Делегування для «Надіслати ще раз» ===
   // modal.addEventListener('click', (e) => {
   //    if (e.target.id === 'resendCode') {
   //       e.preventDefault();
   //       console.log('Надсилання коду відбулося!'); // <- це буде показано у консолі
   //       codeText.textContent = `Код повторно надіслано на ${emailInput.value}. Перевірте пошту.`;
   
   //       const confirmationInput = document.getElementById('confirmationCode');
   //       if (confirmationInput) confirmationInput.value = '';
   //    }
   // });
}

// Функція для показу кроків
function showStep(step) {
   const stepEmail = modal.querySelector('.step-email');
   const stepCode = modal.querySelector('.step-code');

   if (step === 'email') {
      stepEmail.classList.add('active');
      stepCode.classList.remove('active');
   } else if (step === 'code') {
      stepEmail.classList.remove('active');
      stepCode.classList.add('active');
   }
}
