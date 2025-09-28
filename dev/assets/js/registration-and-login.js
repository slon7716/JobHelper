const loginForm = document.querySelector('.registration, .enter-the-site');

if (loginForm) {
  const inputs = loginForm.querySelectorAll('input[type="text"], input[type="password"], input[type="email"]');
  const loginBtn = loginForm.querySelector('#loginBtn');
  const emailInput = loginForm.querySelector('.email');
  const passwordInput = loginForm.querySelector('.password');
  const incorrectBlock = loginForm.querySelector('.incorrect');

  // Перевірка пароля
  const isPasswordValid = password => /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/.test(password);

  // Універсальна перевірка всіх інпутів
  const checkInputs = () => {
    let allFilled = true;

    inputs.forEach(input => {
      const value = input.value.trim();

      if (!value) {
        allFilled = false;
        input.classList.remove('error');
        return;
      }

      // Email перевіряємо через браузерну валідацію
      if (input.classList.contains('email')) {
        if (value.length > 0 && !input.checkValidity()) {
          input.classList.add('error');
          allFilled = false;
        } else {
          input.classList.remove('error');
        }
      }

      // Пароль тільки для реєстрації
      if (input.classList.contains('password') && loginForm.classList.contains('registration')) {
        if (value.length > 0 && !isPasswordValid(value)) {
          input.classList.add('error');
          allFilled = false;
        } else {
          input.classList.remove('error');
        }
      }
    });

    if (loginBtn) loginBtn.disabled = !allFilled;
  };

  // Слухаємо всі інпути
  inputs.forEach(input => input.addEventListener('input', checkInputs));
  checkInputs();

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
  
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
  
    // Проста перевірка (тут можна поставити свої "правильні" дані)
    if (email === "test@mail.com" && password === "123456") {
      window.location.href = "main-page.html"; // перехід на головну
      return; // обов'язково зупиняємо далі
    }
  
    // якщо невірні дані – показати повідомлення
    incorrectBlock.style.display = "flex";
  });

  // Додаткова логіка для реєстрації
  if (loginForm.classList.contains('registration')) {
    const passwordInput = loginForm.querySelector('.password');
    const infoLock = loginForm.querySelector('.info-lock');
    const modalLogin = document.getElementById('loginModal');
    const startFinding = document.getElementById('startFinding');

    if (passwordInput && infoLock) {
      passwordInput.addEventListener('input', () => {
        const value = passwordInput.value.trim();
        infoLock.classList.toggle('show', value.length > 0 && !isPasswordValid(value));
      });
    }

    if (loginBtn && modalLogin) {
      loginForm.addEventListener('submit', e => {
        e.preventDefault();
        modalLogin.style.display = 'flex';
      });

      if (startFinding) {
        startFinding.addEventListener('click', () => {
          window.location.href = 'main-page.html';
        });
      }

      modalLogin.addEventListener('click', e => {
        if (e.target === modalLogin) modalLogin.style.display = 'none';
      });

      window.addEventListener('keydown', e => {
        if (e.key === 'Escape') modalLogin.style.display = 'none';
      });
    }
  }
}
