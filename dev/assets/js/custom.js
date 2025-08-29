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