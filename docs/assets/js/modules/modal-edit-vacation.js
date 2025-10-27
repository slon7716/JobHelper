import { renderSlide } from './render-slide.js';

export function modalEditVacation(cardsSwiper, saveSlides) {
   const editModalCard = document.getElementById('editModal');
   const closeModalEdit = document.getElementById('closeModalEdit');
   const jobForm = document.getElementById('jobFormEdit');
   const formatInput = jobForm.querySelector('#format');
   const formatButtons = jobForm.querySelectorAll('.format-buttons button');
   const swiperWrapper = document.querySelector('.swiper-wrapper');
   const saveChangesBtn = document.getElementById('saveChangesBtn');
   const deleteJobBtn = document.getElementById('deleteJobBtn');
   let currentSlide = null; // зберігаємо поточний слайд

   if (saveChangesBtn) saveChangesBtn.disabled = true;

   // --- Валідація ---
   function checkFormValidity() {
      const mainFields = [
         jobForm.querySelector('#position'),
         jobForm.querySelector('#company'),
         jobForm.querySelector('#location'),
         jobForm.querySelector('#salary'),
         jobForm.querySelector('#format')
      ];
      saveChangesBtn.disabled = !mainFields.every(f => (f.value || '').trim() !== '');
   }

   // --- Слухачі на перші 4 поля + формат-кнопки ---
   jobForm.querySelectorAll('#position, #company, #location, #salary, #format')
      .forEach(input => input.addEventListener('input', checkFormValidity));
   formatButtons.forEach(btn => {
      btn.addEventListener('click', () => {
         btn.classList.toggle('active');
         const activeValues = Array.from(formatButtons)
            .filter(b => b.classList.contains('active'))
            .map(b => b.dataset.value);
         formatInput.value = activeValues.join(', ');
         checkFormValidity();
      });
   });

   // Заповнюємо форму наявними даними
   function openEditModal(slide) {
      currentSlide = slide;
      editModalCard.style.display = 'block';

      ['position', 'company', 'location', 'salary', 'format', 'description']
         .forEach(id => jobForm.querySelector(`#${id}`).value = slide.querySelector(`.${id}`)?.textContent.trim() || '');
      // Навички
      const skillInputs = jobForm.querySelectorAll('input[name="skills[]"]');
      const skillDivs = slide.querySelectorAll('.required-skills-item div:last-child');
      skillInputs.forEach((input, i) => input.value = skillDivs[i]?.textContent.trim() || '');
      // Перемикання кнопок "формат роботи"
      formatButtons.forEach(btn => {
         btn.classList.toggle('active', slide.querySelector('.format')?.textContent.includes(btn.dataset.value));
      });

      checkFormValidity();
   }

   // --- Збереження змін ---
   saveChangesBtn.addEventListener('click', async () => {
      if (!currentSlide) return;
      const slideId = currentSlide.dataset.slideId;
      const skills = Array.from(jobForm.querySelectorAll('input[name="skills[]"]'))
         .map(i => i.value.trim())
         .filter(Boolean);
      const updatedData = {
         title: jobForm.querySelector('#position').value.trim(),
         company: jobForm.querySelector('#company').value.trim(),
         location: jobForm.querySelector('#location').value.trim(),
         salary: jobForm.querySelector('#salary').value.trim(),
         workFormat: jobForm.querySelector('#format').value.trim(),
         requiredSkills: skills,
         description: jobForm.querySelector('#description').value.trim()
      };

      try {
         const token = localStorage.getItem("jwtToken");
         const response = await fetch(`http://localhost:8080/api/jobs/${slideId}`, {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
         });

         if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error ${response.status}: ${errorText}`);
         }

         // --- Оновлюємо DOM тільки після успішного PUT ---
         const newSlide = renderSlide({ ...updatedData, slideId });
         swiperWrapper.replaceChild(newSlide, currentSlide);
         saveSlides();
         if (cardsSwiper) {
            cardsSwiper.update();
            cardsSwiper.slideTo(0);
         }

         editModalCard.style.display = 'none';
         alert("Картку успішно оновлено!");

      } catch (err) {
         console.error("❌ Помилка оновлення:", err);
         alert("Помилка мережі: " + err);
      }
   });

   // --- Видалення ---
   deleteJobBtn.addEventListener('click', async () => {
      if (!currentSlide) return;
      const slideId = currentSlide.dataset.slideId;
      if (!confirm("Ви дійсно хочете видалити картку?")) return;
      
      try {
         const token = localStorage.getItem("jwtToken");
         const response = await fetch(`http://localhost:8080/api/jobs/${slideId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
         });
         
         if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error ${response.status}: ${errorText}`);
         }
         
         currentSlide.remove();
         saveSlides();
         editModalCard.style.display = 'none';
         alert("Картку успішно видалено!");
         
      } catch (err) {
         console.error("❌ Помилка видалення:", err);
         alert("Помилка мережі: " + err);
      }
   });
   
   // --- Закриття модалки ---
   closeModalEdit.addEventListener('click', () => editModalCard.style.display = 'none');
   window.addEventListener('click', e => {
      if (e.target === editModalCard) editModalCard.style.display = 'none';
   });
   
   return { openEditModal };
}
