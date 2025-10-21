export function initCardControls(updateCountsCallback) {
  const viewModal = document.getElementById('viewModal');
  const transferModal = document.getElementById('transferModal');
  let cardToMove = null;

   // Закриття модалки перегляду картки
  if (viewModal) {
    const closeModalBtn = viewModal.querySelector('.btn-primary');
    closeModalBtn.addEventListener('click', () => { viewModal.style.display = 'none'; });
    viewModal.addEventListener('click', e => { if (e.target === viewModal) viewModal.style.display = 'none'; });
  }

   // Закриття модалки переміщення при кліку поза контентом
  if (transferModal) {
    transferModal.addEventListener('click', e => { 
      if (e.target === transferModal) {
        transferModal.style.display = 'none'; 
        cardToMove = null;
      }
    });
  }

   // Делегування подій на картки
  document.addEventListener('click', async (e) => {
    const card = e.target.closest('.swiper-slide');
    if (!card) return;

    // --- Видалення картки ---
    if (e.target.closest('.btn-delete')) {
      if (!confirm("Ви дійсно хочете видалити картку?")) return;
      const slideId = card.dataset.slideId;
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await fetch(`http://localhost:8080/api/applications/${slideId}`, {
          method: "DELETE",
          headers: {
           "Authorization": `Bearer ${token}`
          }
        });
        if (response.status === 204) {
          card.remove();
          updateCountsCallback();
          console.log(`✅ Card ${slideId} successfully deleted.`);
          alert(`Картку №${slideId} успішно видалено.`);
          return;
        }
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error ${response.status}: ${errorText}`);
        }
      
      } catch (err) {
        console.error("❌ Error deleting card:", err);
        alert("Помилка при видаленні картки: " + err.message);
      }
      return;
    }
    
     // --- Перегляд картки ---
    if (e.target.closest('.btn-expand')) {
      const modalBody = viewModal.querySelector('.modal-card-content');
      modalBody.innerHTML = card.innerHTML;
        const modalSalaryEl = modalBody.querySelector('.item.salary');
      if (modalSalaryEl) {
        const salaryValue = modalSalaryEl.textContent.replace('₴','').trim();
        modalSalaryEl.innerHTML = `<span style="font-size:20px; margin-right:2px;">₴</span>${salaryValue}`;
      }
        viewModal.style.display = 'flex';
      return;
    }

    // --- Переміщення картки ---
    if (e.target.closest('.btn-transfer')) {
      cardToMove = card;
      const oldColumn = card.closest('.status-column');
      let selectedStatus = oldColumn.id; // беремо id замість класу
      const statusOptions = transferModal.querySelectorAll('.status-options li');

      // Встановлюємо початковий стан виділення статусу
      statusOptions.forEach(option => {
        option.classList.toggle('selected', option.dataset.status === selectedStatus);
        option.onclick = () => {
          statusOptions.forEach(o => o.classList.remove('selected'));
          option.classList.add('selected');
          selectedStatus = option.dataset.status;
        };
      });
      transferModal.style.display = 'flex';

      // Підтвердити переміщення
      const confirmBtn = document.getElementById('confirmTransfer');
      confirmBtn.onclick = async () => {
        if (!cardToMove) return;
        const selectedOption = transferModal.querySelector('.status-options li.selected');
        if (!selectedOption) return;
        const slideId = cardToMove.dataset.slideId;
        const oldColumn = cardToMove.closest('.status-column');
        const newStatus = selectedOption.dataset.status;
        // перевірка по id чи не той самий статус
        if (oldColumn.id === newStatus) {
          transferModal.style.display = 'none';
          cardToMove = null;
          return;
        }

        try {
          const token = localStorage.getItem("jwtToken");
          const response = await fetch(`http://localhost:8080/api/jobs/${slideId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error ${response.status}: ${errorText}`);
          }

          const targetColumn = document.querySelector(`.status-column#${newStatus} .status-cards`);
          if (targetColumn) {
            targetColumn.appendChild(cardToMove);
          }
          cardToMove = null;
          transferModal.style.display = 'none';
          updateCountsCallback();
        } catch (err) {
          console.error("❌ Помилка оновлення:", err);
          alert("Помилка мережі: " + err);
        }
      };

      // Скасувати переміщення
      const cancelBtn = document.getElementById('cancelTransfer');
      cancelBtn.onclick = () => {
        cardToMove = null;
        transferModal.style.display = 'none';
      };
    }
  });
}
 