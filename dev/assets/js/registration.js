const registrationForm = document.getElementById('registration-form');
const modalLogin = document.getElementById('login-modal');
const startFinding = document.getElementById('start-finding');

if (registrationForm) {
  const inputs = registrationForm.querySelectorAll('input');
  const loginBtn = registrationForm.querySelector('#login-btn');
  const passwordInput = registrationForm.querySelector('.password');
  const repeatPasswordInput = registrationForm.querySelector('.repeat-password');
  const infoLock = registrationForm.querySelector('.info-lock');
  const errorMessage = registrationForm.querySelector('.error-message');

  const isPasswordValid = password => /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/.test(password);

  const checkInputs = () => {
    let allFilled = true;

    inputs.forEach(input => {
      const value = input.value.trim();
      if (!value) {
        allFilled = false;
        input.classList.remove('error');
        return;
      }

      if (input.classList.contains('email') && !input.checkValidity()) {
        input.classList.add('error');
        allFilled = false;
      } else if (input.classList.contains('email')) {
        input.classList.remove('error');
      }

      if (input.classList.contains('password') && !isPasswordValid(value)) {
        input.classList.add('error');
        allFilled = false;
      } else if (input.classList.contains('password')) {
        input.classList.remove('error');
      }
    });

    if (loginBtn) loginBtn.disabled = !allFilled;
  };

  inputs.forEach(input => input.addEventListener('input', () => {
    checkInputs();
    if (infoLock) {
      const value = passwordInput.value.trim();
      infoLock.classList.toggle('show', value.length > 0 && !isPasswordValid(value));
    }
  }));
  checkInputs();

  const showError = msg => {
    if (errorMessage) {
      errorMessage.textContent = msg;
      errorMessage.style.display = 'block';
    } else {
      alert(msg);
    }
  };

  const hideError = () => {
    if (errorMessage) errorMessage.style.display = 'none';
  };

  registrationForm.addEventListener('submit', async e => {
    e.preventDefault();

    const firstName = registrationForm.querySelector('.first-name').value.trim();
    const lastName = registrationForm.querySelector('.last-name').value.trim();
    const email = registrationForm.querySelector('.email').value.trim();
    const password = passwordInput.value.trim();
    const repeatPassword = repeatPasswordInput.value.trim();

    if (password !== repeatPassword) {
      showError("Паролі не співпадають");
      return;
    }

    const payload = { firstName, lastName, email, password, repeatPassword };

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        hideError();
        if (modalLogin) modalLogin.style.display = 'flex';
      } else {
        const data = await response.json();
        showError(data.message || "Сталася помилка. Спробуйте ще раз.");
      }

    } catch (err) {
      showError("Не вдалося підключитися до сервера");
      console.error(err);
    }
  });
}

// ================= MODAL =================
if (modalLogin) {
  startFinding?.addEventListener('click', () => window.location.href = 'main-page.html');
  modalLogin.addEventListener('click', e => { if (e.target === modalLogin) modalLogin.style.display = 'none'; });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') modalLogin.style.display = 'none'; });
}
