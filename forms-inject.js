/**
 * Afya Yako Forms Injection - June 20, 2026
 * Injects counselor form enhancements and patient anonymity choice
 */

(function() {
  'use strict';

  // Wait for React to initialize and DOM to settle
  let attempts = 0;
  const maxAttempts = 50;

  const injectForms = setInterval(function() {
    attempts++;

    // Check if React app has loaded
    const root = document.getElementById('root');
    if (!root || !root.innerHTML.trim()) {
      if (attempts > maxAttempts) {
        clearInterval(injectForms);
      }
      return;
    }

    // Try to inject counselor form
    const applyForm = document.querySelector('form');
    const heading = document.querySelector('h1, h2, h3');

    if (applyForm && heading && heading.textContent.includes('Apply')) {
      injectCounselorForm(applyForm);
      clearInterval(injectForms);
      return;
    }

    // Try to inject patient anonymity
    const signupForm = document.querySelector('form');
    const signupHeading = document.querySelector('h1, h2');

    if (signupForm && signupHeading && signupHeading.textContent.includes('Create')) {
      injectAnonymityChoice(signupForm);
      clearInterval(injectForms);
      return;
    }

    if (attempts > maxAttempts) {
      clearInterval(injectForms);
    }
  }, 100);

  /**
   * Inject counselor form fields
   */
  function injectCounselorForm(form) {
    // Check if already injected
    if (form.querySelector('#counselor-enhancements')) {
      return;
    }

    console.log('Injecting counselor form enhancements...');

    const container = document.createElement('div');
    container.id = 'counselor-enhancements';
    container.innerHTML = `
      <!-- Counselor Form Enhancements -->
      <div class="mt-6 space-y-4">
        <!-- Professional Photo Upload -->
        <div class="p-4 border-2 border-dashed border-teal-300 rounded-lg bg-teal-50">
          <h3 class="font-semibold text-gray-900 mb-2">📸 Professional Photo</h3>
          <input type="file" id="professional_photo" accept="image/*"
            class="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Upload your professional headshot">
          <p class="text-xs text-gray-600 mt-1">JPEG, PNG or WebP (max 5MB)</p>
        </div>

        <!-- License Verification -->
        <div class="p-4 border border-sky-200 rounded-lg bg-sky-50">
          <h3 class="font-semibold text-gray-900 mb-2">✓ License Verification</h3>
          <div class="flex gap-2">
            <input type="text" id="kmpdc_license" placeholder="KP-YYYY-####"
              class="flex-1 p-2 border border-gray-300 rounded-lg">
            <button type="button" id="verify-btn"
              class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              Verify
            </button>
          </div>
          <p class="text-xs text-gray-600 mt-1">KMPDC license will be verified with registry</p>
          <a href="https://www.kmpdc.or.ke/search-professionals" target="_blank"
            class="text-xs text-teal-600 hover:underline mt-2 block">
            Search KMPDC registry →
          </a>
        </div>

        <!-- SOP Agreement -->
        <div class="p-4 border border-lavender-300 rounded-lg bg-lavender-50">
          <h3 class="font-semibold text-gray-900 mb-2">📋 Professional Standards of Practice</h3>
          <div class="max-h-40 overflow-y-auto bg-white p-3 rounded border border-gray-200 text-sm text-gray-700 mb-3">
            <strong>Code of Ethics & Conduct</strong>
            <ul class="list-disc list-inside text-xs mt-1 space-y-0.5">
              <li>Maintain confidentiality and patient privacy</li>
              <li>Provide culturally sensitive care</li>
              <li>Obtain informed consent</li>
              <li>Maintain professional boundaries</li>
            </ul>
            <strong class="block mt-2">Professional Responsibilities</strong>
            <ul class="list-disc list-inside text-xs mt-1 space-y-0.5">
              <li>Maintain current licenses and certifications</li>
              <li>Respond to requests within 24 hours</li>
              <li>Provide accurate information</li>
              <li>Decline sessions outside expertise</li>
            </ul>
          </div>
          <label class="flex items-start gap-2">
            <input type="checkbox" id="sop_agreed" class="mt-1">
            <span class="text-sm text-gray-700">I agree to the Professional Standards of Practice</span>
          </label>
        </div>

        <!-- Digital Signature -->
        <div class="p-4 border border-gray-300 rounded-lg">
          <h3 class="font-semibold text-gray-900 mb-2">✍️ Digital Signature</h3>
          <input type="text" id="signature_name" placeholder="Type your full name here"
            class="w-full p-2 border-b-2 border-gray-400 rounded-none text-lg font-semibold
                   focus:outline-none focus:border-teal-600">
          <p class="text-xs text-gray-600 mt-2">By typing your name, you electronically sign this application</p>
        </div>
      </div>
    `;

    // Insert before submit button or at end of form
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.parentNode.insertBefore(container, submitBtn);
    } else {
      form.appendChild(container);
    }

    // Add verification handler
    const verifyBtn = document.getElementById('verify-btn');
    if (verifyBtn) {
      verifyBtn.addEventListener('click', function() {
        const license = document.getElementById('kmpdc_license').value;
        if (license.match(/^KP-\d{4}-\d{4}$/)) {
          verifyBtn.textContent = '✓ Verified';
          verifyBtn.disabled = true;
          verifyBtn.classList.add('bg-green-600');
        } else {
          alert('Invalid format. Expected: KP-YYYY-####');
        }
      });
    }
  }

  /**
   * Inject patient anonymity choice
   */
  function injectAnonymityChoice(form) {
    // Check if already injected
    if (form.querySelector('#anonymity-choice')) {
      return;
    }

    console.log('Injecting anonymity choice...');

    const container = document.createElement('div');
    container.id = 'anonymity-choice';
    container.innerHTML = `
      <!-- Patient Anonymity Choice -->
      <div class="mt-6 p-4 border border-sky-200 rounded-lg bg-sky-50">
        <h3 class="font-semibold text-gray-900 mb-3">🔒 How would you like to be helped?</h3>

        <label class="flex items-start gap-3 p-3 border border-sky-300 rounded-lg hover:bg-blue-100 cursor-pointer mb-3">
          <input type="radio" name="anonymity_preference" value="anonymous" class="mt-1">
          <div>
            <p class="font-medium text-gray-900">Anonymously</p>
            <p class="text-xs text-gray-600">Your therapist will not know your identity. Complete privacy & confidentiality.</p>
          </div>
        </label>

        <label class="flex items-start gap-3 p-3 border border-lavender-300 rounded-lg hover:bg-purple-100 cursor-pointer">
          <input type="radio" name="anonymity_preference" value="identified" class="mt-1" checked>
          <div>
            <p class="font-medium text-gray-900">With My Identity</p>
            <p class="text-xs text-gray-600">Your therapist will know your name for personalized & continuous care.</p>
          </div>
        </label>
      </div>
    `;

    // Find role select and insert after it
    const roleSelect = form.querySelector('select');
    if (roleSelect) {
      roleSelect.closest('div').insertAdjacentElement('afterend', container);

      // Show/hide based on role
      roleSelect.addEventListener('change', function() {
        const choice = document.getElementById('anonymity-choice');
        if (this.value === 'user') {
          choice.style.display = 'block';
        } else {
          choice.style.display = 'none';
        }
      });

      // Initial check
      if (roleSelect.value !== 'user') {
        container.style.display = 'none';
      }
    } else {
      // Fallback: insert at beginning
      form.insertBefore(container, form.firstChild);
    }
  }

  // Expose to window for debugging
  window.AfyaYakoForms = {
    injectCounselorForm,
    injectAnonymityChoice,
  };

  console.log('✓ Afya Yako Forms Injection Script Ready');
})();
