/**
 * Patient Anonymity Choice - June 20, 2026
 * Adds anonymity preference to patient signup
 */

(function() {
  'use strict';

  console.log('🔧 Patient Anonymity Choice Module Loading...');

  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
      injectAnonymityChoice();
    }, 500);
  });

  /**
   * Inject anonymity choice into signup form
   */
  function injectAnonymityChoice() {
    // Find signup form
    const form = document.querySelector('form');
    if (!form) {
      console.log('Form not found, retrying...');
      setTimeout(injectAnonymityChoice, 1000);
      return;
    }

    // Check if we're on signup page
    const heading = document.querySelector('h1, h2, h3');
    if (!heading || !heading.textContent.includes('Create')) {
      console.log('Not on signup page');
      return;
    }

    // Check if already injected
    if (document.getElementById('anonymity-section')) {
      console.log('✓ Anonymity choice already injected');
      return;
    }

    console.log('✓ Injecting patient anonymity choice...');

    const section = document.createElement('div');
    section.id = 'anonymity-section';
    section.className = 'card space-y-3 mt-4 border-2 border-sky-300 bg-sky-50';
    section.innerHTML = `
      <h3 class="font-bold text-lg text-gray-900">🔒 How would you like to be helped?</h3>
      <p class="text-xs text-gray-600">Choose whether your therapist knows your identity</p>

      <div class="space-y-2">
        <!-- Anonymous Option -->
        <label class="flex items-start gap-3 p-4 border-2 border-sky-300 rounded-lg hover:bg-sky-100 transition cursor-pointer">
          <input type="radio" name="anonymity_preference" value="anonymous" class="mt-1.5">
          <div class="flex-1">
            <p class="font-semibold text-gray-900">🕵️ Anonymously</p>
            <p class="text-xs text-gray-700 mt-1">
              Your therapist will not know your identity. Complete privacy and confidentiality.
              Perfect if you want to discuss sensitive issues without revealing who you are.
            </p>
            <p class="text-xs text-sky-700 font-medium mt-2">✓ Best for: Sensitive topics, complete privacy</p>
          </div>
        </label>

        <!-- Identified Option -->
        <label class="flex items-start gap-3 p-4 border-2 border-lavender-300 rounded-lg hover:bg-purple-100 transition cursor-pointer">
          <input type="radio" name="anonymity_preference" value="identified" class="mt-1.5" checked>
          <div class="flex-1">
            <p class="font-semibold text-gray-900">👤 With My Identity</p>
            <p class="text-xs text-gray-700 mt-1">
              Your therapist will know your name for personalized care. Enables better continuity of treatment,
              personalized recommendations, and building a therapeutic relationship.
            </p>
            <p class="text-xs text-lavender-700 font-medium mt-2">✓ Best for: Ongoing therapy, personalized care</p>
          </div>
        </label>
      </div>

      <div class="bg-white border border-sky-200 rounded-lg p-3 text-xs text-gray-700 space-y-1">
        <p><strong>Note:</strong> Your choice can be changed anytime in your settings.</p>
        <p>Either way, all your information is encrypted and protected under Kenya's Data Protection Act 2019.</p>
      </div>
    `;

    // Find where to insert
    const roleSelect = form.querySelector('select');
    if (roleSelect) {
      roleSelect.closest('div').insertAdjacentElement('afterend', section);

      // Show/hide based on role
      roleSelect.addEventListener('change', function() {
        const anonSection = document.getElementById('anonymity-section');
        if (this.value === 'user') {
          anonSection.style.display = 'block';
        } else {
          anonSection.style.display = 'none';
        }
      });

      // Initial check
      if (roleSelect.value !== 'user') {
        section.style.display = 'none';
      }
    } else {
      // Fallback: insert at beginning
      form.insertBefore(section, form.firstChild);
    }

    console.log('✓ Patient anonymity choice injected');
  }

  window.PatientAnonymity = {
    injectAnonymityChoice,
  };

  console.log('✓ Patient Anonymity Module Ready');
})();
