const logoutBtn = document.getElementById('logoutBtn');
const modalLogout = document.getElementById('logoutModal');
const confirmLogout = document.getElementById('confirmLogout');
const cancelLogout = document.getElementById('cancelLogout');

if (logoutBtn && modalLogout) { 
  // показати модалку
  logoutBtn.addEventListener('click', () => {
    modalLogout.style.display = 'flex';
  });
  
  // натиснули "скасувати"
  cancelLogout.addEventListener('click', () => {
    modalLogout.style.display = 'none';
  });
  
  // натиснули "так"
  confirmLogout.addEventListener('click', () => {
    // редирект на головну сторінку або будь-яку іншу
    window.location.href = 'index.html';
  });
  
  // закриття по кліку поза модалкою
  modalLogout.addEventListener('click', (e) => {
    if (e.target === modalLogout) {
      modalLogout.style.display = 'none';
    }
  });
}
