// Беремо форму (на будь-якій сторінці вона одна головна)
const form = document.querySelector('form');
if (form) {
  const inputs = form.querySelectorAll('input[type="text"], input[type="password"]');
  const loginBtn = form.querySelector('#loginBtn');
  // const togglePassword = form.querySelector('.toggle-password');
  // const passwordInput = form.querySelector('.password');

  // Функція для перевірки, чи всі інпути заповнені
  function checkInputs() {
    let allFilled = true;
    inputs.forEach(input => {
      if (input.value.trim() === '') {
        allFilled = false;
      }
    });
    loginBtn.disabled = !allFilled;
  }

  // Слухаємо всі інпути
  inputs.forEach(input => {
    input.addEventListener('input', checkInputs);
  });

  // Показ/приховування пароля
  // if (togglePassword && passwordInput) {
  //   const toggleIcon = togglePassword.querySelector('#eye');
  //   togglePassword.addEventListener('click', () => {
  //     if (passwordInput.type === 'password') {
  //       passwordInput.type = 'text';
  //       toggleIcon.src = 'assets/img/eye.svg';
  //     } else {
  //       passwordInput.type = 'password';
  //       toggleIcon.src = 'assets/img/eye-grey.svg';
  //     }
  //   });
  // }
   
   // Регулярка для перевірки пароля
  function isPasswordValid(password) {
      const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;
      return regex.test(password);
  }
 
   const registrationForm = document.querySelector('.registration form');
   if (registrationForm) { // Якщо ми на сторінці реєстрації
      const passwordInput = registrationForm.querySelector('.password');
      const infoLock = registrationForm.querySelector('.info-lock');
 
      passwordInput.addEventListener('input', () => {
         const value = passwordInput.value.trim();
 
         if (value.length === 0) {
         // якщо поле порожнє — сховати блок
            infoLock.classList.remove('show');
         } else if (isPasswordValid(value)) {
         // якщо пароль валідний — сховати
            infoLock.classList.remove('show');
         } else {
         // якщо не валідний — показати
            infoLock.classList.add('show');
         }
      });
   } 
}
