const enterTheSite = document.querySelector('.enter-the-site');

if (enterTheSite) {
  const loginForm = enterTheSite.querySelector('#loginForm');
  const emailInput = enterTheSite.querySelector('.email');
  const passwordInput = enterTheSite.querySelector('.password');
  const incorrectBlock = enterTheSite.querySelector('.incorrect');
  const loginBtn = enterTheSite.querySelector('#loginBtn');

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

    // ---------------------------
    // Локальна перевірка для тесту
    if (email === "test@mail.com" && password === "123456") {
      window.location.href = "main-page.html";
      return;
    }
    // ---------------------------

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log("Response from backend:", data);

      if (!response.ok) {
        if (incorrectBlock) incorrectBlock.style.display = "flex";
        return;
      }

      const token = data.token || data.jwt || data.access_token;
      if (token) {
        localStorage.setItem("jwtToken", token);
        window.location.href = "main-page.html";
      } else {
        alert("Сервер не повернув токен!");
      }
    } catch (err) {
      alert("Помилка при відправці запиту!");
      console.error(err);
    }
  });
}