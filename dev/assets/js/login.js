const loginForm = document.querySelector('.enter-the-site');

if (loginForm) {
  const emailInput = loginForm.querySelector('.email');
  const passwordInput = loginForm.querySelector('.password');
  const incorrectBlock = loginForm.querySelector('.incorrect');
  const loginBtn = loginForm.querySelector('#loginBtn');

  // Перевірка email і пароля на наявність символів
  const checkInputs = () => {
    let allFilled = true;

    [emailInput, passwordInput].forEach(input => {
      const value = input.value.trim();
      if (!value || (input.classList.contains('email') && !input.checkValidity())) {
        allFilled = false;
        input.classList.add('error');
      } else {
        input.classList.remove('error');
      }
    });

    if (loginBtn) loginBtn.disabled = !allFilled;
  };

  emailInput.addEventListener('input', checkInputs);
  passwordInput.addEventListener('input', checkInputs);
  checkInputs();

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Локальна перевірка для тесту
    if (email === "test@mail.com" && password === "123456") {
      window.location.href = "main-page.html";
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        if (incorrectBlock) incorrectBlock.style.display = "flex";
        return;
      }

      const token = data.token || data.jwt || data.access_token;
      if (token) {
        localStorage.setItem("jwtToken", token);
        window.location.href = "dashboard.html";
      } else {
        alert("Сервер не повернув токен!");
      }
    } catch (err) {
      alert("Помилка при відправці запиту!");
      console.error(err);
    }
  });
}
