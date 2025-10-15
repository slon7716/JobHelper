export function renderJob(job, targetColumn = 'saved') {
   const column = document.querySelector(`.status-column.status-${targetColumn} .status-cards`);
   if (!column) return;
 
   // Перевірка дублювання
   const exists = Array.from(column.querySelectorAll('.swiper-slide'))
                       .some(card => card.dataset.jobId === job.id);
   if (exists) return;
 
   const div = document.createElement('div');
   div.classList.add('swiper-slide');
   div.dataset.jobId = job.id;
   div.dataset.job = JSON.stringify(job);
 
   // HTML картки
   div.innerHTML = `
     <div class="job-title">
       <div class="position-and-control">
         <div class="position">${job.title}</div>
         <div class="control-buttons">
           <button type="button" class="btn-delete">
             <img src="assets/img/close-grey.svg" alt="close">
           </button>
           <button type="button" class="btn-expand">
             <img src="assets/img/extand-grey.svg" alt="extand">
           </button>
           <button type="button" class="btn-transfer">
             <img src="assets/img/transfer-grey.svg" alt="transfer">
           </button>
         </div>
       </div>
       <div class="job-details">
         <div class="items">
           <img src="assets/img/building.svg" alt="icon">
           <div class="item company-name">${job.company}</div>
         </div>
         <div class="items">
           <img src="assets/img/location.svg" alt="location">
           <div class="item location">${job.location}</div>
         </div>
         <div class="items">
           <img src="assets/img/pig.svg" alt="pig">
           <div class="item salary">${job.salary}</div>
         </div>
       </div>
       <div class="match">85% match</div>
     </div>
 
     <div class="characteristic-name work-format">
       <div class="title">Формат роботи:</div>
       <div class="format">${job.workFormat}</div>
     </div>
 
     <div class="characteristic-name required-skills">
       <div class="title">Необхідні навички:</div>
       <div class="required-skills-list">
         ${Array.isArray(job.requiredSkills) ? job.requiredSkills.map(skill => `
           <div class="required-skills-item">
             <img src="assets/img/ellipse-grey.svg" alt="item">
             <div>${skill}</div>
           </div>
         `).join('') : ''}
       </div>
     </div>
 
     <div class="characteristic-name job-description">
       <div class="title">Опис вакансії:</div>
       <div class="description">${job.description}</div>
     </div>
   `;
 
   column.appendChild(div);
}
 