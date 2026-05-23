/**
 * VELVET BLOOM - Custom Multi-Step Booking Wizard
 * Form-free design handling wizard progress steps, active selection updates, field validators, and success screen triggers.
 */

document.addEventListener('DOMContentLoaded', () => {
  initBookingWizard();
});

function initBookingWizard() {
  const wizardContainer = document.getElementById('booking-wizard');
  if (!wizardContainer) return;

  // Wizard state store
  const state = {
    currentStep: 1,
    service: null,
    price: null,
    date: null,
    time: null,
    customer: {
      name: '',
      phone: '',
      email: '',
      notes: ''
    }
  };

  // Greyed out unavailable time slots
  const unavailableSlots = ['11AM', '3PM', '5PM'];

  // DOM Cache
  const stepContainers = document.querySelectorAll('.wizard-step-content');
  const progressBarSteps = document.querySelectorAll('.progress-step');
  const summaryService = document.getElementById('summary-service');
  const summaryPrice = document.getElementById('summary-price');
  const summaryDate = document.getElementById('summary-date');
  const summaryTime = document.getElementById('summary-time');
  const summaryTotal = document.getElementById('summary-total');
  const summaryCard = document.getElementById('booking-summary-card');

  // Load preset services if query string matches
  prepopulateFromURL();

  // Bind Service Radio Card clicks
  const serviceCards = document.querySelectorAll('.service-radio-card');
  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      serviceCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      state.service = card.getAttribute('data-service-name');
      state.price = card.getAttribute('data-service-price');

      updateSummaryPanel();
      clearInlineError('step-1-error');
    });
  });

  // Render mock custom date buttons
  renderCustomDateGrid();

  // Setup Time slot buttons click bindings
  setupTimeSlotButtons();

  // Bind input listeners for real-time validation feedback
  setupDetailsInputListeners();

  // Navigation button handlers
  const nextButtons = document.querySelectorAll('.btn-wizard-next');
  const prevButtons = document.querySelectorAll('.btn-wizard-prev');

  nextButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateStep(state.currentStep)) {
        changeStep(state.currentStep + 1);
      }
    });
  });

  prevButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      changeStep(state.currentStep - 1);
    });
  });

  // Final submit click
  const submitBtn = document.getElementById('btn-submit-booking');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      if (validateStep(3)) {
        executeBookingSuccess();
      }
    });
  }

  /**
   * Reads URL parameters to pre-select a service card if navigated from services.html
   */
  function prepopulateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get('service');
    if (!serviceParam) return;

    const targetCard = Array.from(serviceCards).find(card => 
      card.getAttribute('data-service-slug') === serviceParam
    );

    if (targetCard) {
      targetCard.click();
    }
  }

  /**
   * Renders dynamic styled date selectors starting from current day
   */
  function renderCustomDateGrid() {
    const dateGrid = document.getElementById('date-picker-grid');
    if (!dateGrid) return;

    dateGrid.innerHTML = '';
    
    // Generate dates for the next 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);

      // Velvet Bloom Jamshedpur is closed on Mondays! Let's mark it as closed, but wait, 
      // the FAQ says "Mon-Sat 9AM-8PM, Sun 10AM-6PM", so they are open every day.
      const dayName = days[futureDate.getDay()];
      const dayNum = futureDate.getDate();
      const monthName = months[futureDate.getMonth()];
      const formattedDate = `${dayNum} ${monthName} (${dayName})`;

      const dateBtn = document.createElement('div');
      dateBtn.className = 'date-option-card flex-center';
      dateBtn.innerHTML = `
        <span class="day-name">${dayName}</span>
        <span class="day-number">${dayNum}</span>
        <span class="month-name">${monthName}</span>
      `;

      dateBtn.addEventListener('click', () => {
        const activeCards = dateGrid.querySelectorAll('.date-option-card');
        activeCards.forEach(c => c.classList.remove('selected'));
        dateBtn.classList.add('selected');

        state.date = formattedDate;
        updateSummaryPanel();
        clearInlineError('step-2-error');
      });

      dateGrid.appendChild(dateBtn);
    }
  }

  /**
   * Prepares interactive time slots and overlays locked/disabled indicators
   */
  function setupTimeSlotButtons() {
    const timeSlots = document.querySelectorAll('.time-slot-option');
    timeSlots.forEach(slot => {
      const slotVal = slot.getAttribute('data-time');
      
      // If mock booked, disable
      if (unavailableSlots.includes(slotVal)) {
        slot.classList.add('booked');
        slot.style.opacity = '0.4';
        slot.style.cursor = 'not-allowed';
      } else {
        slot.addEventListener('click', () => {
          timeSlots.forEach(s => s.classList.remove('selected'));
          slot.classList.add('selected');
          
          state.time = slotVal;
          updateSummaryPanel();
          clearInlineError('step-2-error');
        });
      }
    });
  }

  /**
   * Syncs custom input structures back into the main state store
   */
  function setupDetailsInputListeners() {
    const inputs = {
      name: document.getElementById('input-name'),
      phone: document.getElementById('input-phone'),
      email: document.getElementById('input-email'),
      notes: document.getElementById('input-notes')
    };

    if (inputs.name) {
      inputs.name.addEventListener('input', (e) => {
        state.customer.name = e.target.value.trim();
        clearInlineError('error-name');
      });
    }
    if (inputs.phone) {
      inputs.phone.addEventListener('input', (e) => {
        state.customer.phone = e.target.value.trim();
        clearInlineError('error-phone');
      });
    }
    if (inputs.email) {
      inputs.email.addEventListener('input', (e) => {
        state.customer.email = e.target.value.trim();
        clearInlineError('error-email');
      });
    }
    if (inputs.notes) {
      inputs.notes.addEventListener('input', (e) => {
        state.customer.notes = e.target.value.trim();
      });
    }
  }

  /**
   * Transitions wizard viewport elements gracefully
   */
  function changeStep(newStep) {
    if (newStep < 1 || newStep > 3) return;

    const currentContainer = document.querySelector(`.wizard-step-content[data-step="${state.currentStep}"]`);
    const nextContainer = document.querySelector(`.wizard-step-content[data-step="${newStep}"]`);

    if (currentContainer && nextContainer) {
      // Outward slide direction based on navigation flow
      const slideOutClass = newStep > state.currentStep ? 'slide-out-left' : 'slide-out-right';
      const slideInClass = newStep > state.currentStep ? 'slide-in-right' : 'slide-in-left';

      currentContainer.style.opacity = '0';
      currentContainer.style.transform = newStep > state.currentStep ? 'translateX(-30px)' : 'translateX(30px)';

      setTimeout(() => {
        currentContainer.classList.remove('active');
        
        nextContainer.classList.add('active');
        // Trigger reflow
        nextContainer.offsetHeight;
        
        nextContainer.style.opacity = '1';
        nextContainer.style.transform = 'translateX(0)';
      }, 300);
    }

    // Update Progress markers
    progressBarSteps.forEach((mark, idx) => {
      if (idx + 1 < newStep) {
        mark.classList.add('completed');
        mark.classList.remove('active');
      } else if (idx + 1 === newStep) {
        mark.classList.add('active');
        mark.classList.remove('completed');
      } else {
        mark.classList.remove('completed', 'active');
      }
    });

    state.currentStep = newStep;
  }

  /**
   * Refreshes receipt card contents
   */
  function updateSummaryPanel() {
    if (summaryService) summaryService.textContent = state.service || 'Not Selected';
    if (summaryPrice) summaryPrice.textContent = state.price ? `₹${state.price}` : '—';
    if (summaryDate) summaryDate.textContent = state.date || 'Not Selected';
    if (summaryTime) summaryTime.textContent = state.time || 'Not Selected';
    if (summaryTotal) summaryTotal.textContent = state.price ? `₹${state.price}` : '—';

    // Add subtle flash glow to summary panel to capture attention
    if (summaryCard) {
      summaryCard.classList.add('glow-flash');
      setTimeout(() => summaryCard.classList.remove('glow-flash'), 400);
    }
  }

  /**
   * Form-free validation routine checking state data
   */
  function validateStep(step) {
    let isValid = true;

    if (step === 1) {
      if (!state.service) {
        setInlineError('step-1-error', 'Please choose a beauty service to proceed.');
        isValid = false;
      }
    } else if (step === 2) {
      if (!state.date || !state.time) {
        setInlineError('step-2-error', 'Please select both an appointment date and time slot.');
        isValid = false;
      }
    } else if (step === 3) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile validation

      if (!state.customer.name || state.customer.name.length < 3) {
        setInlineError('error-name', 'Please enter your full name (minimum 3 characters).');
        isValid = false;
      }
      if (!state.customer.phone || !phoneRegex.test(state.customer.phone)) {
        setInlineError('error-phone', 'Please enter a valid 10-digit mobile number.');
        isValid = false;
      }
      if (!state.customer.email || !emailRegex.test(state.customer.email)) {
        setInlineError('error-email', 'Please enter a valid email address.');
        isValid = false;
      }
    }

    return isValid;
  }

  function setInlineError(id, msg) {
    const errorEl = document.getElementById(id);
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
  }

  function clearInlineError(id) {
    const errorEl = document.getElementById(id);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  /**
   * Submit visual flow displaying blooming vector overlay
   */
  function executeBookingSuccess() {
    const successOverlay = document.getElementById('booking-success-overlay');
    if (!successOverlay) return;

    // Set success description panel details
    const successDetail = document.getElementById('success-booking-detail');
    if (successDetail) {
      successDetail.innerHTML = `
        <strong>${state.service}</strong><br>
        📅 ${state.date} at ⏰ ${state.time}<br>
        👤 Confirmed for ${state.customer.name} (${state.customer.phone})
      `;
    }

    successOverlay.classList.add('visible');
    
    // Optional success sounds or celebration triggers could be added here
  }
}
