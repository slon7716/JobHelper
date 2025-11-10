export function renderSlide(jobData) {
  const slide = document.createElement('div');
  slide.classList.add('swiper-slide');
  slide.dataset.slideId = jobData.id || jobData.slideId;
 
  const skillsHTML = (jobData.requiredSkills || []).map(skill => `
    <div class="required-skills-item">
      <img src="assets/img/ellipse-grey.svg" alt="item">
      <div>${skill}</div>
    </div>
  `).join('') || '&nbsp;';
  
  const descriptionHTML = jobData.description?.trim() || '&nbsp;';

  // Якщо match є в jobData, використовуємо його, інакше --
  const matchValue = jobData.match ?? '--';
 
  slide.innerHTML = `
    <div class="job-title">
      <div class="position">${jobData.title}</div>
      <div class="job-details">
        <div class="items">
          <img src="assets/img/building.svg" alt="icon">
          <div class="item company">${jobData.company}</div>
        </div>
        <div class="items">
          <img src="assets/img/location.svg" alt="location">
          <div class="item location">${jobData.location}</div>
        </div>
        <div class="items">
          <img src="assets/img/pig.svg" alt="pig">
          <div class="item salary">${jobData.salary}</div>
        </div>
      </div>
      <div class="match">${matchValue}% match</div>
    </div>
    <div class="characteristic-name work-format">
      <div class="title">Формат роботи:</div>
      <div class="format">${jobData.workFormat}</div>
    </div>
    <div class="characteristic-name required-skills">
      <div class="title">Необхідні навички:</div>
      <div class="required-skills-list">${skillsHTML}</div>
    </div>
    <div class="characteristic-name job-description">
      <div class="title">Опис вакансії:</div>
      <div class="description">${descriptionHTML}</div>
    </div>
    <div class="btns">
      <button class="btn btn-secondary btn-edit">Змінити</button>
      <button class="btn btn-primary move-to-tracker">В трекер</button>
    </div>
  `;

  return slide;
}