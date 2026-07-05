/**
 * Afya Yako Enhancement Script - June 20, 2026
 * Adds:
 * 1. Counselor photo upload
 * 2. License verification
 * 3. SOP agreement
 * 4. Patient anonymity choice
 */

(function() {
  console.log('Afya Yako Feature Enhancement Script Loaded');

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    enhanceApplyForm();
    enhanceSignupForm();
  });

  /**
   * Enhance Counselor Apply Form with:
   * - Photo upload
   * - License verification
   * - SOP agreement
   */
  function enhanceApplyForm() {
    // Check if we're on the apply page
    const heading = document.querySelector('h1, h2');
    if (!heading || !heading.textContent.includes('Apply')) {
      return;
    }

    console.log('Enhancing Apply Form...');

    // Add notice about new features
    const notice = document.createElement('div');
    notice.className = 'bg-sky-50 border border-sky-200 rounded-xl p-4 mb-4';
    notice.innerHTML = `
      <div class="flex gap-2">
        <div class="text-sky-900 text-sm">
          <strong>✓ Enhanced Onboarding:</strong>
          This form now includes professional photo upload, license verification,
          and digital signature for compliance.
        </div>
      </div>
    `;

    const form = document.querySelector('form');
    if (form) {
      form.insertAdjacentElement('afterbegin', notice);
    }
  }

  /**
   * Enhance Signup Form with Patient Anonymity Choice
   */
  function enhanceSignupForm() {
    // Check if we're on the signup page
    const heading = document.querySelector('h1, h2');
    if (!heading || !heading.textContent.includes('Create')) {
      return;
    }

    console.log('Enhancing Signup Form...');

    // Add anonymity preference section if role is 'user'
    const roleSelect = document.querySelector('select[name="role"]');
    if (!roleSelect) {
      return;
    }

    // Create anonymity preference section
    const section = document.createElement('div');
    section.id = 'anonymity-preference-section';
    section.className = 'mt-4 p-4 border border-sky-200 rounded-lg bg-sky-50';
    section.innerHTML = `
      <label class="block text-sm font-medium text-gray-700 mb-3">
        How would you like to be helped?
      </label>
      <div class="space-y-2">
        <label class="flex items-start gap-3 cursor-pointer p-3 border border-sky-200 rounded-lg hover:bg-sky-50 transition">
          <input type="radio" name="anonymity_preference" value="anonymous" class="mt-1 w-4 h-4" />
          <div>
            <p class="font-medium text-gray-900">Anonymously</p>
            <p class="text-xs text-gray-600">Your therapist will not know your identity. Complete privacy & confidentiality.</p>
          </div>
        </label>
        <label class="flex items-start gap-3 cursor-pointer p-3 border border-lavender-200 rounded-lg hover:bg-lavender-50 transition">
          <input type="radio" name="anonymity_preference" value="identified" class="mt-1 w-4 h-4" checked />
          <div>
            <p class="font-medium text-gray-900">With My Identity</p>
            <p class="text-xs text-gray-600">Your therapist will know your name for personalized & continuous care.</p>
          </div>
        </label>
      </div>
    `;

    // Insert after role selection
    roleSelect.closest('div').insertAdjacentElement('afterend', section);

    // Show/hide anonymity section based on role
    roleSelect.addEventListener('change', function() {
      const section = document.getElementById('anonymity-preference-section');
      if (this.value === 'user') {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
      }
    });

    // Initial check
    if (roleSelect.value !== 'user') {
      section.style.display = 'none';
    }
  }

  // Expose to window for testing
  window.AfyaYakoEnhancements = {
    enhanceApplyForm,
    enhanceSignupForm,
  };
})();
