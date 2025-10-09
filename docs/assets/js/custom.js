              // Привласнюємо клас 'active' поточній сторінці
let currentPage = window.location.pathname.split("/").pop(); // Отримуємо поточний URL
// Знаходимо всі посилання у навігації
const navLinks = document.querySelectorAll('.pages a');
// Перевіряємо кожне посилання
navLinks.forEach(link => {
  const linkHref = link.getAttribute('href');
  if (linkHref === currentPage) {
    link.classList.add('active'); // Додаємо клас активному посиланню
  }
});

              // Swiper
const cardsSwiper = new Swiper('.swiper', {
  speed: 700,
  slidesPerView: 'auto',
  spaceBetween: 16,
  freeMode: true,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});

              // активація кнопки для textarea
const textarea = document.getElementById('ideas');
const button = document.querySelector('.feedback .btn');

if (textarea && button) {
  textarea.addEventListener('input', () => {
    if (textarea.value.trim() !== '') {
      button.disabled = false;
    } else {
      button.disabled = true;
    }
  });
}

            // Показати/приховати символи паролю
const toggleButtons = document.querySelectorAll('.toggle-password');
const passwordInputs = document.querySelectorAll('.password, .repeat-password');

toggleButtons.forEach((toggleBtn, index) => {
  const toggleIcon = toggleBtn.querySelector('img');
  const input = passwordInputs[index];

  toggleBtn.addEventListener('mousedown', (e) => {
    e.preventDefault(); // блокуємо фокус на кнопці
    if (input.type === 'password') {
      input.type = 'text';
      toggleIcon.src = 'assets/img/eye.svg';
    } else {
      input.type = 'password';
      toggleIcon.src = 'assets/img/eye-grey.svg';
    }
  });
});

  // ---------------------------
  // MOCK fetch для локального тестування (успішна відповідь)
  // Видали або закоментуй цей блок, коли підключиш реальний сервер.
  // ---------------------------
  // window.fetch = async function (url, options) {
  //   console.log("Mock fetch called:", url, options);
  //   return {
  //     ok: true,
  //     status: 200,
  //     json: async () => ({ message: "Success" })
  //   };
  // };
  // ---------------------------