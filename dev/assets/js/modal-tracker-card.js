const cardModal = document.getElementById('cardModal');
let modalBody = null;
let closeModalBtn = null;

if (cardModal) {
  modalBody = cardModal.querySelector('.modal-body');
  closeModalBtn = cardModal.querySelector('.btn-close-modal');
}

// Функція для оновлення лічильників у всіх колонках
function updateCounts() {
  document.querySelectorAll('.status-column').forEach(col => {
    const count = col.querySelectorAll('.swiper-slide').length;
    const counter = col.querySelector('.status-count');
    if (counter) counter.textContent = count;
  });
}

// Обробка кліків по всій сторінці
document.addEventListener('click', (e) => {
  // 1. Видалення картки
  if (e.target.closest('.btn-close')) {
    const card = e.target.closest('.swiper-slide');
    if (card) {
      card.remove();
      updateCounts();
    }
  }

  // 2. Розширення картки (модалка)
  if (cardModal && e.target.closest('.btn-expand')) {
    const card = e.target.closest('.swiper-slide');
    if (card) {
      modalBody.innerHTML = card.innerHTML; // копіюємо контент картки
      cardModal.style.display = 'flex';
    }
  }

  // 3. Закрити модалку через кнопку
  if (cardModal && e.target.closest('.btn-close-modal')) {
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
        updateCounts();
      }, 300); // має збігатися з transition у CSS
    }
  }
});

// Початковий підрахунок при завантаженні сторінки
updateCounts();
