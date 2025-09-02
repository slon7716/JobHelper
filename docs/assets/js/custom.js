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
