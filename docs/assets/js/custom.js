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
  // centeredSlides: true,
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
const passwordInputs = document.querySelectorAll('.password');

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

              // Вийти чи ні з акаунту
const logoutBtn = document.getElementById('logoutBtn');
const modalLogout = document.getElementById('logoutModal');
const confirmLogout = document.getElementById('confirmLogout');
const cancelLogout = document.getElementById('cancelLogout');

if (logoutBtn && modalLogout) { // показати модалку
  logoutBtn.addEventListener('click', () => {
    modalLogout.style.display = 'flex';
  });
  // натиснули "скасувати"
  cancelLogout.addEventListener('click', () => {
    modalLogout.style.display = 'none';
  });
  // натиснули "так"
  confirmLogout.addEventListener('click', () => {
    window.location.href = 'index.html'; // редирект сторінку lending
  });
  // закриття по кліку поза модалкою
  modalLogout.addEventListener('click', (e) => {
    if (e.target === modalLogout) {
      modalLogout.style.display = 'none';
    }
  });
}