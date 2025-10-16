export function initCardControls(updateCountsCallback) {
   const cardModal = document.getElementById('cardModal');
   const transferModal = document.getElementById('transferModal');

   if (cardModal) {
     const closeModalBtn = cardModal.querySelector('.btn-primary');
     // Закрити модалку через кнопку "Добре"
     closeModalBtn.addEventListener('click', () => {
       cardModal.style.display = 'none';
     });
     // Закрити модалку при кліку поза контентом
     cardModal.addEventListener('click', e => {
       if (e.target === cardModal) {
         cardModal.style.display = 'none';
       }
     });
   }

   // --- Функція збереження нового стану LocalStorage ---
   function saveColumnsState() {
      const allJobs = [];
      document.querySelectorAll('.status-column').forEach(col => {
         const status = col.classList[1]; // saved, in-progress, done, offer, denied
         col.querySelectorAll('.swiper-slide').forEach(card => {
            const job = JSON.parse(card.dataset.job);
            job.status = status;
            allJobs.push(job);
         });
      });
      localStorage.setItem('savedJobs', JSON.stringify(allJobs));
    }

   // ======= Логіка роботи з картками =======
   document.addEventListener('click', e => {
      const card = e.target.closest('.swiper-slide');
      if (!card) return;
 
  // --- Видалення картки ---
      if (e.target.closest('.btn-delete')) {
         if (!confirm("Ви дійсно хочете видалити картку?")) return;
         card.remove();
         saveColumnsState();
         updateCountsCallback();
         return;
      }  

      // --- Подивитись повну інформацію картки ---
      if (e.target.closest('.btn-expand')) {
         const modalBody = document.querySelector('#cardModal .modal-card-content');
         modalBody.innerHTML = card.innerHTML;
       
         const modalSalaryEl = modalBody.querySelector('.item.salary');
         if (modalSalaryEl) {
           const salaryValue = modalSalaryEl.textContent.replace('₴', '').trim();
           modalSalaryEl.innerHTML = `<span style="font-size:20px; margin-right:2px;">₴</span>${salaryValue}`;
         }
       
         cardModal.style.display = 'flex';
         return;
       }
 
      // --- Зміна статусу картки ---
      if (e.target.closest('.btn-transfer')) {
         const statusOptions = transferModal.querySelectorAll('.status-options li');
         let selectedStatus = card.closest('.status-column').classList[1];
         let cardToMove = card;
 
         statusOptions.forEach(option => {
            option.classList.toggle('selected', option.dataset.status === selectedStatus);
            option.addEventListener('click', () => {
               statusOptions.forEach(o => o.classList.remove('selected'));
               option.classList.add('selected');
               selectedStatus = option.dataset.status;
            });
         });
 
         transferModal.style.display = 'flex';
 
         // Підтвердити переміщення
         const confirmBtn = document.getElementById('confirmTransfer');
         confirmBtn.onclick = () => {
            if (cardToMove && selectedStatus) {
               const targetColumn = document.querySelector(`.${selectedStatus} .status-cards`);
               targetColumn.appendChild(cardToMove);
               saveColumnsState();
               updateCountsCallback();
               transferModal.style.display = 'none';
               cardToMove = null;
            }
         };
 
         // Скасувати
         document.getElementById('cancelTransfer').onclick = () => {
            transferModal.style.display = 'none';
            cardToMove = null;
         };
 
            // Закрити модалку при кліку поза контентом
         transferModal.onclick = (ev) => {
            if (ev.target === transferModal) {
               transferModal.style.display = 'none';
               cardToMove = null;
            }
         };
      }
   });
}