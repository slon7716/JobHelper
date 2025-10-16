export function modalEditVacation(cardsSwiper, saveSlides) {
   const editModalCard = document.getElementById('editModal');
   const closeModalEdit = document.getElementById('closeModalEdit');
   const jobForm = document.getElementById('jobFormEdit');
   const formatInput = jobForm.querySelector('#format');
   const formatButtons = jobForm.querySelectorAll('.format-buttons button');
   const swiperWrapper = document.querySelector('.swiper-wrapper');
   const deleteJobBtn = document.getElementById('deleteJobBtn');
   const saveChangesBtn = document.getElementById('saveChangesBtn');
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

   // --- Функція рендеру скілів ---
   function renderSkillsList(skills) {
      return skills.map(s => `
       <div class="required-skills-item">
         <img src="assets/img/ellipse-grey.svg" alt="item">
         <div>${s}</div>
       </div>
     `).join('') || '&nbsp;';
   }

   // --- Слухачі на поля + формат-кнопки додаються один раз ---
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

   // --- Відкриття модалки ---
   swiperWrapper.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-edit');
      if (!btn) return;
      const slide = btn.closest('.swiper-slide');
      if (!slide) return;
      openEditModal(slide);
   });

   function openEditModal(slide) {
      editModalCard.style.display = 'block';
      jobForm.dataset.editingSlide = Array.from(swiperWrapper.children).indexOf(slide);

      // Заповнюємо поля наявними даними
      ['position', 'company', 'location', 'salary', 'format', 'description']
         .forEach(id => jobForm.querySelector(`#${id}`).value = slide.querySelector(`.${id}`)?.textContent.trim() || '');

      // Формат кнопок
      formatButtons.forEach(btn => {
         btn.classList.toggle('active', slide.querySelector('.format')?.textContent.includes(btn.dataset.value));
      });

      // Навички
      const skillInputs = jobForm.querySelectorAll('input[name="skills[]"]');
      const skillDivs = slide.querySelectorAll('.required-skills-item div:last-child');
      skillInputs.forEach((input, i) => input.value = skillDivs[i]?.textContent.trim() || '');

      checkFormValidity();
   }

   // --- Збереження змін ---
   saveChangesBtn.addEventListener('click', async () => {
      const index = jobForm.dataset.editingSlide;
      const slide = swiperWrapper.children[index];
      if (!slide) return;

      const slideId = slide.dataset.slideId;
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
         slide.querySelector('.position').textContent = updatedData.title;
         slide.querySelector('.company').textContent = updatedData.company;
         slide.querySelector('.location').textContent = updatedData.location;
         slide.querySelector('.salary').textContent = updatedData.salary;
         slide.querySelector('.format').textContent = updatedData.workFormat;
         slide.querySelector('.description').textContent = updatedData.description;
         slide.querySelector('.required-skills-list').innerHTML = renderSkillsList(updatedData.requiredSkills);

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
      const index = jobForm.dataset.editingSlide;
      const slide = swiperWrapper.children[index];
      if (!slide) return;
      if (!confirm("Ви дійсно хочете видалити картку?")) return;

      const slideId = slide.dataset.slideId;
      slide.remove();
      saveSlides();

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

         alert("Картку успішно видалено!");
         editModalCard.style.display = 'none';
      } catch (err) {
         console.error("❌ Помилка видалення:", err);
         alert("Помилка мережі: " + err);
      }
   });

   // --- Закриття модалки ---
   closeModalEdit.addEventListener('click', () => editModalCard.style.display = 'none');
   window.addEventListener('click', e => { if (e.target === editModalCard) editModalCard.style.display = 'none'; });
}
