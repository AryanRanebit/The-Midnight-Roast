// Styles are loaded by index.html. Keep all page interactions in this file.
const NAVBAR_SCROLL_THRESHOLD = 50;
const ANCHOR_SCROLL_OFFSET = 70;
const REVEAL_OPTIONS = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px',
};

document.addEventListener('DOMContentLoaded', initializePage);

function initializePage() {
  initializeMobileMenu();
  initializeNavbarScroll();
  initializeAnchorScrolling();
  initializeScrollReveals();
}

function initializeMobileMenu() {
  const menuButton = document.querySelector('.mobile-menu-btn');
  const navigation = document.querySelector('.nav-links');
  const navigationLinks = document.querySelectorAll('.nav-links a');

  menuButton.addEventListener('click', () => {
    menuButton.classList.toggle('active');
    navigation.classList.toggle('active');
  });

  // Choosing a section closes both the drawer and the menu-button animation.
  navigationLinks.forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.classList.remove('active');
      navigation.classList.remove('active');
    });
  });
}

function initializeNavbarScroll() {
  const navbar = document.querySelector('.navbar');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > NAVBAR_SCROLL_THRESHOLD);
  });
}

function initializeAnchorScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));

      if (target) {
        window.scrollTo({
          top: target.offsetTop - ANCHOR_SCROLL_OFFSET,
          behavior: 'smooth',
        });
      }
    });
  });
}

function initializeScrollReveals() {
  const sections = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Reveal each section once, then stop watching it.
        observer.unobserve(entry.target);
      }
    });
  }, REVEAL_OPTIONS);

  sections.forEach((section) => observer.observe(section));
}
