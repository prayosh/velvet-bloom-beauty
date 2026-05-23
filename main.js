/**
 * VELVET BLOOM - Main UI Controller
 * Core functions: glass nav transitions, mobile menu, accordion, gallery filters, custom lightbox, page fades.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Sticky nav glass transition
  initStickyNav();

  // Mobile menu drawer
  initMobileDrawer();

  // Highlight active nav links
  highlightActiveLink();

  // Smooth page-to-page transitions
  initPageTransitions();

  // FAQ Accordion logic
  initFAQAccordion();

  // Services & Gallery Filter Tabs
  initFilterTabs();

  // Gallery Lightbox Controller
  initGalleryLightbox();
});

/**
 * 1. Sticky Navigation Class Toggle
 * Adds background glass styling when user scrolls down
 */
function initStickyNav() {
  const header = document.querySelector('.header-nav');
  if (!header) return;

  function checkScroll() {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', checkScroll);
  checkScroll(); // Initial check on page load
}

/**
 * 2. Mobile Menu Toggle
 * Opens/closes side drawer with sliding animation and burger state changes
 */
function initMobileDrawer() {
  const burger = document.querySelector('.hamburger');
  const drawer = document.querySelector('.mobile-drawer');
  if (!burger || !drawer) return;

  burger.addEventListener('click', () => {
    drawer.classList.toggle('open');
    burger.classList.toggle('active');
    
    // Burger lines animation toggle
    const lines = burger.querySelectorAll('span');
    if (burger.classList.contains('active')) {
      lines[0].style.transform = 'translateY(8px) rotate(45deg)';
      lines[1].style.opacity = '0';
      lines[2].style.transform = 'translateY(-8px) rotate(-45deg)';
    } else {
      lines[0].style.transform = 'none';
      lines[1].style.opacity = '1';
      lines[2].style.transform = 'none';
    }
  });

  // Close drawer when clicking links
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      burger.classList.remove('active');
      const lines = burger.querySelectorAll('span');
      lines[0].style.transform = 'none';
      lines[1].style.opacity = '1';
      lines[2].style.transform = 'none';
    });
  });
}

/**
 * 3. Nav active tab resolver
 * Matches path to highlight active list items in navigation
 */
function highlightActiveLink() {
  const currentPath = window.location.pathname;
  const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
  
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-drawer ul a');
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === pageName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * 4. Silky Page Transitions
 * Plays fadeout, delays loading page link, and fades in gracefully
 */
function initPageTransitions() {
  const links = document.querySelectorAll('a:not([target="_blank"]):not([href^="#"]):not([href^="javascript:"])');
  const pageWrapper = document.querySelector('.page-wrapper');
  
  if (!pageWrapper) return;

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const destination = link.getAttribute('href');
      // If destination is empty or just standard hashes, skip
      if (!destination || destination === '#') return;

      e.preventDefault();
      pageWrapper.classList.add('fade-out');
      
      setTimeout(() => {
        window.location.href = destination;
      }, 450); // Timeout matching CSS fade speed
    });
  });
}

/**
 * 5. FAQ Accordion Controller
 * Dynamically computes scrollHeights for smooth CSS transitions without fixed heights
 */
function initFAQAccordion() {
  const accordions = document.querySelectorAll('.accordion-item');
  if (accordions.length === 0) return;

  accordions.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other accordions
      accordions.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.accordion-content').style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        // Set dynamic height from child layout
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

/**
 * 6. Services & Gallery Grid Filter Tabs
 * Filter items according to categories with sliding underline visuals
 */
function initFilterTabs() {
  const tabContainers = document.querySelectorAll('.filter-tabs');
  if (tabContainers.length === 0) return;

  tabContainers.forEach(container => {
    const tabs = container.querySelectorAll('.tab-btn');
    const targetGrid = document.querySelector(container.getAttribute('data-target-grid'));
    
    // Create and append underline elements for sliding transitions
    const underline = document.createElement('span');
    underline.className = 'tab-underline';
    container.appendChild(underline);

    function positionUnderline(activeTab) {
      underline.style.width = activeTab.offsetWidth + 'px';
      underline.style.left = activeTab.offsetLeft + 'px';
    }

    tabs.forEach(tab => {
      // Set active state on load
      if (tab.classList.contains('active')) {
        setTimeout(() => positionUnderline(tab), 100);
      }

      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        positionUnderline(tab);

        const filterValue = tab.getAttribute('data-filter');
        filterGridItems(targetGrid, filterValue);
      });
    });

    window.addEventListener('resize', () => {
      const activeTab = container.querySelector('.tab-btn.active');
      if (activeTab) positionUnderline(activeTab);
    });
  });

  function filterGridItems(grid, filter) {
    if (!grid) return;
    const cards = grid.querySelectorAll('.filterable-card');

    cards.forEach(card => {
      const categories = card.getAttribute('data-category').split(' ');
      
      // Animate fade-out before hidden state
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9) translateY(20px)';
      
      setTimeout(() => {
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1) translateY(0)';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      }, 300);
    });
  }
}

/**
 * 7. Custom Vector Lightbox
 * Simple robust script allowing seamless slider transitions of inline SVGs
 */
function initGalleryLightbox() {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;

  const cards = galleryGrid.querySelectorAll('.filterable-card');
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = lightbox.querySelector('.lightbox-content-placeholder');
  const prevBtn = lightbox.querySelector('.lightbox-nav.prev');
  const nextBtn = lightbox.querySelector('.lightbox-nav.next');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  let activeIndex = -1;
  let activeCards = [];

  // Gather currently visible cards based on filters
  function updateActiveCards() {
    activeCards = Array.from(cards).filter(card => card.style.display !== 'none');
  }

  cards.forEach(card => {
    const trigger = card.querySelector('.gallery-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      updateActiveCards();
      
      const parentCard = trigger.closest('.filterable-card');
      activeIndex = activeCards.indexOf(parentCard);
      openLightbox(parentCard);
    });
  });

  function openLightbox(card) {
    if (!card) return;
    const svgElement = card.querySelector('svg').cloneNode(true);
    
    // Clean animations from showing inside preview
    svgElement.removeAttribute('class');
    
    lightboxContent.innerHTML = '';
    lightboxContent.appendChild(svgElement);
    
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      lightboxContent.innerHTML = '';
    }, 400);
  }

  function navigateLightbox(direction) {
    updateActiveCards();
    if (activeCards.length <= 1) return;

    if (direction === 'next') {
      activeIndex = (activeIndex + 1) % activeCards.length;
    } else {
      activeIndex = (activeIndex - 1 + activeCards.length) % activeCards.length;
    }

    const nextCard = activeCards[activeIndex];
    
    // Smooth transition animations on change
    lightboxContent.style.opacity = '0';
    lightboxContent.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      const svgElement = nextCard.querySelector('svg').cloneNode(true);
      lightboxContent.innerHTML = '';
      lightboxContent.appendChild(svgElement);
      lightboxContent.style.opacity = '1';
      lightboxContent.style.transform = 'scale(1)';
    }, 200);
  }

  // Bind click handlers
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => navigateLightbox('prev'));
  if (nextBtn) nextBtn.addEventListener('click', () => navigateLightbox('next'));
  
  // Close lightbox on clicking dark backdrop
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation bindings
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') navigateLightbox('next');
    if (e.key === 'ArrowLeft') navigateLightbox('prev');
  });
}
