const cardModal = document.getElementById('cardModal');
let modalBody = null;
let closeModalBtn = null;

if (cardModal) {
  modalBody = cardModal.querySelector('.modal-card-content');
  closeModalBtn = cardModal.querySelector('.btn-primary');
}

// Обробка кліків по всій сторінці
document.addEventListener('click', (e) => {
  // 1. Видалення картки
  if (e.target.closest('.btn-close')) {
    const card = e.target.closest('.swiper-slide');
    if (card) {
      card.remove();
    }
  }

  // 2. Розширення картки (модалка)
  if (cardModal && e.target.closest('.btn-expand')) {
    const card = e.target.closest('.swiper-slide');
    if (card) {
      // Копіюємо контент картки
      modalBody.innerHTML = card.innerHTML;
  
      // Додаємо символ ₴ як окремий span тільки у модалці
      const modalSalaryEl = modalBody.querySelector('.item.salary');
      if (modalSalaryEl) {
        const salaryValue = modalSalaryEl.textContent.replace('₴', '').trim();
        modalSalaryEl.innerHTML = `<span style="font-size:20px; margin-right:2px;">₴</span>${salaryValue}`;
      }
  
      // Відкриваємо модалку
      cardModal.style.display = 'flex';
    }
  }

  // 3. Закрити модалку через кнопку
  if (cardModal && e.target.closest('.btn-primary')) {
    cardModal.style.display = 'none';
  }

  // 4. Закрити модалку при кліку поза контентом
  if (cardModal && e.target === cardModal) {
    cardModal.style.display = 'none';
  }

  // 5. Перенесення картки вправо
  if (e.target.closest('.btn-transfer')) {
    const card = e.target.closest('.swiper-slide');
    const currentColumn = e.target.closest('.status-column');
    const nextColumn = currentColumn ? currentColumn.nextElementSibling : null;

    if (card && nextColumn) {
      // Додаємо клас для анімації
      card.classList.add('moving');

      // Чекаємо завершення transition
      setTimeout(() => {
        nextColumn.querySelector('.status-cards').appendChild(card);
        card.classList.remove('moving');
      }, 300); // має збігатися з transition у CSS
    }
  }
});