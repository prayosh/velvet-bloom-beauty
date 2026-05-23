/**
 * VELVET BLOOM - Animations Controller
 * Handles falling canvas petals, scroll reveal observers, counters, and parallax effects.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize and run the Canvas Petal Simulation
  initPetalSimulation();

  // Scroll Reveal Animations using IntersectionObserver
  initScrollReveals();

  // Animated Counters for Stats
  initStatsCounters();

  // Mouse Parallax on Hero Section
  initHeroParallax();

  // Clone Testimonials for Seamless Infinite Loop
  initTestimonialMarquee();
});

/**
 * 1. High-Performance Canvas Petal Simulation
 * Generates beautiful wind-swept falling pink rose petals
 */
function initPetalSimulation() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  // Resize canvas to match container size
  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const petalCount = 30;
  const petals = [];
  
  // Custom Petal class definition
  class Petal {
    constructor() {
      this.reset();
      // Randomize initial Y so they don't all drop from the top together
      this.y = Math.random() * canvas.height;
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = -20;
      this.size = Math.random() * 8 + 8; // Size between 8px and 16px
      this.speedY = Math.random() * 1 + 0.8; // Falling speed
      this.speedX = Math.random() * 0.8 - 0.4; // Sway horizontal speed
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = Math.random() * 0.02 - 0.01;
      this.color = Math.random() > 0.5 ? '#e8a0bf' : '#c778a0'; // Pink or Mauve
      this.opacity = Math.random() * 0.4 + 0.4;
      this.swayAmplitude = Math.random() * 1.5 + 0.5;
      this.swayFrequency = Math.random() * 0.01 + 0.005;
      this.swayTime = Math.random() * 100;
    }

    update() {
      this.y += this.speedY;
      this.swayTime += this.swayFrequency;
      this.x += this.speedX + Math.sin(this.swayTime) * this.swayAmplitude;
      this.angle += this.spinSpeed;

      // Reset when falling out of bounds
      if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = this.opacity;
      
      // Draw stylized rose petal (curved leaf shape)
      ctx.beginPath();
      ctx.fillStyle = this.color;
      
      // Path drawing for a lovely curved petal
      ctx.moveTo(0, -this.size / 2);
      ctx.quadraticCurveTo(this.size / 1.5, -this.size / 2, this.size / 2, 0);
      ctx.quadraticCurveTo(this.size / 1.5, this.size / 2, 0, this.size / 2);
      ctx.quadraticCurveTo(-this.size / 1.5, this.size / 2, -this.size / 2, 0);
      ctx.quadraticCurveTo(-this.size / 1.5, -this.size / 2, 0, -this.size / 2);
      
      ctx.fill();
      ctx.restore();
    }
  }

  // Populate petals
  for (let i = 0; i < petalCount; i++) {
    petals.push(new Petal());
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    petals.forEach(petal => {
      petal.update();
      petal.draw();
    });
    
    animationFrameId = requestAnimationFrame(animate);
  }

  animate();

  // Stop animation if tab goes background
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrameId);
    } else {
      animate();
    }
  });
}

/**
 * 2. Scroll Reveal Observer
 * Staggered fading entry for sections, columns, and cards
 */
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

/**
 * 3. Count-up Stats Script
 * Increments statistical counters dynamically when scrolled into view
 */
function initStatsCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length === 0) return;

  const observerOptions = {
    root: null,
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const targetCount = parseInt(target.getAttribute('data-count'), 10);
        animateCounter(target, targetCount);
        observer.unobserve(target);
      }
    });
  }, observerOptions);

  statNumbers.forEach(num => observer.observe(num));

  function animateCounter(element, targetVal) {
    let startVal = 0;
    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.floor(easeProgress * targetVal);

      element.textContent = currentVal + (element.getAttribute('data-suffix') || '');

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = targetVal + (element.getAttribute('data-suffix') || '');
      }
    }

    requestAnimationFrame(updateCounter);
  }
}

/**
 * 4. Multi-Axis Mouse Parallax
 * Gently offsets decorative vectors and illustrations based on cursor position
 */
function initHeroParallax() {
  const heroSection = document.querySelector('.hero-section');
  if (!heroSection) return;

  const parallaxTargets = heroSection.querySelectorAll('.parallax-target');

  heroSection.addEventListener('mousemove', (e) => {
    const { width, height } = heroSection.getBoundingClientRect();
    const mouseX = (e.clientX - width / 2) / (width / 2); // Value between -1 and 1
    const mouseY = (e.clientY - height / 2) / (height / 2); // Value between -1 and 1

    parallaxTargets.forEach(target => {
      const depth = parseFloat(target.getAttribute('data-depth')) || 0.05;
      const moveX = mouseX * depth * 50;
      const moveY = mouseY * depth * 50;
      target.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  });

  // Parallax on standard vertical scrolling
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    parallaxTargets.forEach(target => {
      const speed = parseFloat(target.getAttribute('data-scroll-speed')) || 0.1;
      const moveY = scrolled * speed;
      // Combine mouse translate and scroll if mousemove already styled it
      target.style.transform = `translateY(${moveY}px)`;
    });
  });
}

/**
 * 5. Testimonial Infinite Loop Helper
 * Clones testimonial cards for a perfect uninterrupted continuous loop
 */
function initTestimonialMarquee() {
  const marquee = document.querySelector('.marquee-content');
  if (!marquee) return;

  // Clone all items within marquee to double the children and secure infinite overlap
  const children = Array.from(marquee.children);
  children.forEach(child => {
    const clone = child.cloneNode(true);
    marquee.appendChild(clone);
  });
}
