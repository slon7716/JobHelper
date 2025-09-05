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
const carouselWeekly = new Swiper('.swiper', {
   speed: 700,
   slidesPerView: 'auto',
   spaceBetween: 16,
   // centeredSlides: true,
   freeMode: true,
   navigation: {
     nextEl: '.swiper-button-next',
     prevEl: '.swiper-button-prev',
   },
   // breakpoints: {
   //   1025: {
   //     spaceBetween: 40,
   //   },
   // },
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

const emailInput = document.getElementById('email');
const passwordInput = document.querySelector('.password');
const loginBtn = document.getElementById('loginBtn');
const togglePassword = document.querySelector('.toggle-password');

// Функція для перевірки, чи активувати кнопку
function checkInputs() {
  if (emailInput.value.trim() !== '' && passwordInput.value.trim() !== '') {
    loginBtn.disabled = false;
  } else {
    loginBtn.disabled = true;
  }
}

// Слухаємо введення у полях
if (emailInput) emailInput.addEventListener('input', checkInputs);
if (passwordInput) passwordInput.addEventListener('input', checkInputs);

// Показ/приховування пароля та зміна іконки
if (togglePassword) { 
  const toggleIcon = togglePassword.querySelector('#eye');
  togglePassword.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleIcon.src = 'assets/img/eye.svg';
    } else {
      passwordInput.type = 'password';
      toggleIcon.src = 'assets/img/eye-grey.svg';
    }
  });
}
