// Беремо головну форму
const form = document.querySelector('form');

if (form) {
  const inputs = form.querySelectorAll('input[type="text"], input[type="password"]');
  const loginBtn = form.querySelector('#loginBtn');

  // Функція для перевірки, чи всі інпути заповнені
  function checkInputs() {
    let allFilled = true;
    inputs.forEach(input => {
      if (input.value.trim() === '') {
        allFilled = false;
      }
    });
    if (loginBtn) loginBtn.disabled = !allFilled;
  }

  // Слухаємо всі інпути
  inputs.forEach(input => {
    input.addEventListener('input', checkInputs);
  });

  // --- Додаткова логіка тільки для сторінки реєстрації ---
  if (form.closest('.registration')) {
    // Регулярка для перевірки пароля
    function isPasswordValid(password) {
      const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;
      return regex.test(password);
    }

    const passwordInput = form.querySelector('.password');
    const infoLock = form.querySelector('.info-lock');
    const modalLogin = document.getElementById('loginModal');
    const startFinding = document.getElementById('startFinding');

    // Валідація пароля
    if (passwordInput && infoLock) {
      passwordInput.addEventListener('input', () => {
        const value = passwordInput.value.trim();
        if (value.length === 0 || isPasswordValid(value)) {
          infoLock.classList.remove('show');
        } else {
          infoLock.classList.add('show');
        }
      });
    }

    // Сабміт форми → показати модалку
    if (loginBtn && modalLogin) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // тут можна додати відправку на сервер (fetch)
        modalLogin.style.display = 'flex';
      });

      if (startFinding) {
        startFinding.addEventListener('click', () => {
          window.location.href = 'main-page.html';
        });
      }

      modalLogin.addEventListener('click', (e) => {
        if (e.target === modalLogin) {
          modalLogin.style.display = 'none';
        }
      });
    }
  }
}
