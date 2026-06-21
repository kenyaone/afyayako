/**
 * Afya Yako Complete Counselor Onboarding Form - June 20, 2026
 * Full form with specializations, languages, photo upload, payment info
 */

(function() {
  'use strict';

  // Platform configuration
  const PLATFORM_FEE_PERCENT = 35;
  const KMPDC_API_URL = '/api/professionals';

  console.log('🔧 Afya Yako Counselor Form Setup Starting...');

  // Wait for page to load
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
      injectCounselorFormComplete();
    }, 500);
  });

  /**
   * Complete counselor form injection
   */
  function injectCounselorFormComplete() {
    // Find the apply form
    const formContainer = document.querySelector('form, [role="form"]');
    if (!formContainer) {
      console.log('Form container not found, retrying...');
      setTimeout(injectCounselorFormComplete, 1000);
      return;
    }

    // Check if already injected
    if (document.getElementById('counselor-form-complete')) {
      console.log('✓ Form already injected');
      return;
    }

    console.log('✓ Injecting complete counselor form...');

    const form = document.createElement('div');
    form.id = 'counselor-form-complete';
    form.className = 'space-y-4';
    form.innerHTML = `
      <!-- Professional Photo Upload (NEW SECTION) -->
      <div class="card space-y-3 border-2 border-teal-300 bg-teal-50">
        <h3 class="font-bold text-lg text-gray-900">📸 Professional Photo</h3>
        <p class="text-xs text-gray-600">Upload a clear professional headshot for your profile</p>

        <div id="photo-preview-container" class="border-2 border-dashed border-teal-400 rounded-lg p-8 text-center hover:bg-teal-100 transition cursor-pointer"
          onclick="document.getElementById('professional_photo').click()">
          <div id="photo-placeholder">
            <svg class="w-12 h-12 mx-auto text-teal-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p class="font-medium text-gray-700">Click to upload photo</p>
            <p class="text-xs text-gray-600 mt-1">PNG, JPG, WebP (max 5MB)</p>
          </div>
          <img id="photo-preview" style="display:none" class="w-32 h-32 mx-auto rounded-full object-cover border-4 border-teal-200">
        </div>

        <input type="file" id="professional_photo" name="professional_photo" accept="image/*"
          style="display:none" onchange="handlePhotoUpload(this)">
        <p id="photo-error" style="display:none" class="text-red-600 text-xs"></p>
      </div>

      <!-- License Upload (NEW SECTION) -->
      <div class="card space-y-3 border-2 border-sky-300 bg-sky-50">
        <h3 class="font-bold text-lg text-gray-900">📄 License Document Upload</h3>
        <p class="text-xs text-gray-600">Upload a copy of your KMPDC or CPB license certificate</p>

        <div class="border-2 border-dashed border-sky-400 rounded-lg p-6 text-center hover:bg-sky-100 transition cursor-pointer"
          onclick="document.getElementById('license_document').click()">
          <svg class="w-8 h-8 mx-auto text-sky-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
          <p class="font-medium text-gray-700">Click to upload license</p>
          <p class="text-xs text-gray-600 mt-1">PDF, JPG, PNG (max 10MB)</p>
        </div>

        <input type="file" id="license_document" name="license_document"
          accept=".pdf,.jpg,.jpeg,.png" style="display:none" onchange="handleLicenseUpload(this)">
        <p id="license-filename" style="display:none" class="text-xs text-green-600"><strong id="license-name"></strong> ✓</p>
      </div>

      <!-- Specializations Dropdown -->
      <div class="card space-y-3">
        <h3 class="font-bold text-lg text-gray-900">🎯 Core Specialties <span class="text-red-500">*</span></h3>
        <p class="text-xs text-gray-600">Select all areas of expertise</p>

        <div id="specializations-container" class="space-y-2">
          <div class="flex items-center gap-2">
            <input type="checkbox" id="spec-trauma" name="specializations" value="trauma">
            <label for="spec-trauma" class="text-sm cursor-pointer">Trauma & PTSD</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="spec-couples" name="specializations" value="couples">
            <label for="spec-couples" class="text-sm cursor-pointer">Couples & Relationship Therapy</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="spec-anxiety" name="specializations" value="anxiety">
            <label for="spec-anxiety" class="text-sm cursor-pointer">Anxiety & Panic Disorders</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="spec-depression" name="specializations" value="depression">
            <label for="spec-depression" class="text-sm cursor-pointer">Depression & Mood Disorders</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="spec-substance" name="specializations" value="substance_abuse">
            <label for="spec-substance" class="text-sm cursor-pointer">Substance Abuse & Addiction</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="spec-family" name="specializations" value="family">
            <label for="spec-family" class="text-sm cursor-pointer">Family Therapy</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="spec-grief" name="specializations" value="grief">
            <label for="spec-grief" class="text-sm cursor-pointer">Grief & Loss</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="spec-eating" name="specializations" value="eating_disorders">
            <label for="spec-eating" class="text-sm cursor-pointer">Eating Disorders</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="spec-ocd" name="specializations" value="ocd">
            <label for="spec-ocd" class="text-sm cursor-pointer">OCD & Anxiety Disorders</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="spec-lgbtq" name="specializations" value="lgbtq">
            <label for="spec-lgbtq" class="text-sm cursor-pointer">LGBTQ+ Affirming Therapy</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="spec-parenting" name="specializations" value="parenting">
            <label for="spec-parenting" class="text-sm cursor-pointer">Parenting & Child Issues</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="spec-other" name="specializations" value="other">
            <label for="spec-other" class="text-sm cursor-pointer">Other (specify below)</label>
          </div>
        </div>
        <input type="text" id="spec-other-text" placeholder="Please specify other specialties..."
          class="w-full p-2 border border-gray-300 rounded-lg text-sm">
      </div>

      <!-- Languages Dropdown -->
      <div class="card space-y-3">
        <h3 class="font-bold text-lg text-gray-900">🌐 Languages <span class="text-red-500">*</span></h3>
        <p class="text-xs text-gray-600">Select all languages you can conduct sessions in</p>

        <div id="languages-container" class="space-y-2">
          <div class="flex items-center gap-2">
            <input type="checkbox" id="lang-english" name="languages" value="english" checked>
            <label for="lang-english" class="text-sm cursor-pointer">English</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="lang-swahili" name="languages" value="swahili">
            <label for="lang-swahili" class="text-sm cursor-pointer">Kiswahili</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="lang-french" name="languages" value="french">
            <label for="lang-french" class="text-sm cursor-pointer">French</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="lang-arabic" name="languages" value="arabic">
            <label for="lang-arabic" class="text-sm cursor-pointer">Arabic</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="lang-kikuyu" name="languages" value="kikuyu">
            <label for="lang-kikuyu" class="text-sm cursor-pointer">Kikuyu</label>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="lang-other" name="languages" value="other">
            <label for="lang-other" class="text-sm cursor-pointer">Other</label>
          </div>
        </div>
      </div>

      <!-- Payment Information (UPDATED) -->
      <div class="card space-y-4 border-2 border-green-300 bg-green-50">
        <h3 class="font-bold text-lg text-gray-900">💰 Payment Information</h3>
        <p class="text-xs text-gray-600 bg-white p-2 rounded border border-green-200">
          <strong>Platform Fee: 35%</strong><br>
          You receive: <strong>65%</strong> of session fees. Payouts within 24 hours.
        </p>

        <!-- M-Pesa Section (KEPT - you're earning payment) -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">
            M-Pesa Number (for payouts) <span class="text-red-500">*</span>
          </label>
          <input type="tel" id="mpesa_number" name="mpesa_number" placeholder="0712345678"
            class="w-full p-2 border border-gray-300 rounded-lg" required>
          <p class="text-xs text-gray-600 mt-1">Your M-Pesa account for receiving payments</p>
        </div>

        <!-- Bank Details Section (NEW) -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">
            Bank Account (Optional)
          </label>
          <div class="space-y-2">
            <input type="text" id="bank_name" name="bank_name" placeholder="Bank Name"
              class="w-full p-2 border border-gray-300 rounded-lg">
            <input type="text" id="account_number" name="account_number" placeholder="Account Number"
              class="w-full p-2 border border-gray-300 rounded-lg">
            <input type="text" id="account_name" name="account_name" placeholder="Account Holder Name"
              class="w-full p-2 border border-gray-300 rounded-lg">
            <input type="text" id="branch_code" name="branch_code" placeholder="Branch Code"
              class="w-full p-2 border border-gray-300 rounded-lg">
          </div>
          <p class="text-xs text-gray-600 mt-2">For alternative payout method (optional)</p>
        </div>

        <!-- Session Rate (KEPT) -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">
            Session Rate (KES/hour) <span class="text-red-500">*</span>
          </label>
          <div class="flex items-center gap-2">
            <input type="number" id="rate_per_hour" name="rate_per_hour" placeholder="2500"
              class="flex-1 p-2 border border-gray-300 rounded-lg" min="500" required>
            <span class="text-sm text-gray-600">KES/hr</span>
          </div>
          <div id="earnings-preview" class="mt-3 p-3 bg-white rounded border border-green-300 text-sm">
            <p class="text-gray-700">Per session (1 hour):</p>
            <p class="font-bold text-green-700">You earn: <span id="your-earnings">0</span> KES</p>
            <p class="text-xs text-gray-600">(35% platform fee deducted)</p>
          </div>
        </div>
      </div>

      <!-- SOP Agreement -->
      <div class="card space-y-3 border-2 border-lavender-300 bg-lavender-50">
        <h3 class="font-bold text-gray-900">📋 Professional Standards of Practice</h3>
        <div class="max-h-48 overflow-y-auto bg-white p-3 rounded border border-gray-300 text-sm text-gray-700 space-y-2">
          <div>
            <strong class="text-gray-900">✓ Code of Ethics & Conduct</strong>
            <ul class="list-disc list-inside text-xs mt-1 space-y-0.5 text-gray-600">
              <li>Maintain strict confidentiality and patient privacy</li>
              <li>Provide culturally sensitive and non-discriminatory care</li>
              <li>Obtain informed consent before treatment</li>
              <li>Maintain professional boundaries with all clients</li>
              <li>Report suspected abuse to relevant authorities</li>
            </ul>
          </div>
          <div>
            <strong class="text-gray-900">✓ Professional Responsibilities</strong>
            <ul class="list-disc list-inside text-xs mt-1 space-y-0.5 text-gray-600">
              <li>Maintain current professional licenses and certifications</li>
              <li>Respond to session requests within 24 hours</li>
              <li>Provide accurate information on your profile</li>
              <li>Adhere to scheduled sessions and communicate cancellations</li>
              <li>Decline sessions outside your area of expertise</li>
            </ul>
          </div>
          <div>
            <strong class="text-gray-900">✓ Technology & Data Security</strong>
            <ul class="list-disc list-inside text-xs mt-1 space-y-0.5 text-gray-600">
              <li>Use secure platforms for all patient communications</li>
              <li>Never share patient information with third parties</li>
              <li>Keep all devices used for sessions password protected</li>
              <li>Comply with Kenya Data Protection Act 2019</li>
            </ul>
          </div>
        </div>
        <label class="flex items-start gap-2 mt-3">
          <input type="checkbox" id="sop_agreed" name="sop_agreed" class="mt-1">
          <span class="text-sm text-gray-700">I have read and agree to abide by the Professional Standards of Practice</span>
        </label>
      </div>

      <!-- Digital Signature -->
      <div class="card space-y-3">
        <h3 class="font-bold text-gray-900">✍️ Digital Signature</h3>
        <label class="block text-sm font-semibold text-gray-900 mb-1">
          Sign with Your Full Name <span class="text-red-500">*</span>
        </label>
        <input type="text" id="signature_name" name="signature_name" placeholder="Type your full name"
          class="w-full p-2 border-b-2 border-gray-400 text-lg font-semibold rounded-none
                 focus:outline-none focus:border-teal-600 focus:ring-0">
        <p class="text-xs text-gray-600 mt-2">By typing your name, you electronically sign this application</p>
      </div>

      <!-- License Verification -->
      <div class="card space-y-3 bg-sky-50 border-2 border-sky-300">
        <h3 class="font-bold text-gray-900">✓ KMPDC License Verification</h3>
        <label class="block text-sm font-semibold text-gray-900 mb-1">
          KMPDC License Number <span class="text-red-500">*</span>
        </label>
        <div class="flex gap-2">
          <input type="text" id="kmpdc_license" name="kmpdc_license" placeholder="KP-YYYY-####"
            class="flex-1 p-2 border border-gray-300 rounded-lg" required>
          <button type="button" id="verify-license-btn" onclick="verifyLicense()"
            class="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium">
            Verify
          </button>
        </div>
        <div id="verify-status" style="display:none" class="mt-2 p-2 rounded text-sm">
          <p id="verify-message"></p>
        </div>
        <a href="https://www.kmpdc.or.ke/search-professionals" target="_blank"
          class="text-xs text-sky-600 hover:underline">
          Search KMPDC registry →
        </a>
      </div>
    `;

    // Insert into page
    const existingForm = formContainer.querySelector('form') || formContainer;
    if (existingForm.querySelector('button[type="submit"]')) {
      existingForm.querySelector('button[type="submit"]').parentNode.insertBefore(form, existingForm.querySelector('button[type="submit"]'));
    } else {
      existingForm.appendChild(form);
    }

    // Add event listeners
    addFormEventListeners();
    console.log('✓ Counselor form injected successfully');
  }

  /**
   * Handle photo upload
   */
  window.handlePhotoUpload = function(input) {
    const file = input.files[0];
    if (!file) return;

    const errorEl = document.getElementById('photo-error');
    const placeholder = document.getElementById('photo-placeholder');
    const preview = document.getElementById('photo-preview');

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      errorEl.textContent = 'Photo must be less than 5MB';
      errorEl.style.display = 'block';
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      errorEl.textContent = 'Only JPEG, PNG, and WebP allowed';
      errorEl.style.display = 'block';
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
      placeholder.style.display = 'none';
      preview.src = e.target.result;
      preview.style.display = 'block';
      errorEl.style.display = 'none';
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handle license document upload
   */
  window.handleLicenseUpload = function(input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('License document must be less than 10MB');
      return;
    }

    // Show filename
    document.getElementById('license-name').textContent = file.name;
    document.getElementById('license-filename').style.display = 'block';
  };

  /**
   * Verify KMPDC license
   */
  window.verifyLicense = function() {
    const licenseInput = document.getElementById('kmpdc_license');
    const license = licenseInput.value.trim();
    const btn = document.getElementById('verify-license-btn');
    const statusDiv = document.getElementById('verify-status');
    const statusMsg = document.getElementById('verify-message');

    if (!license) {
      alert('Please enter a license number');
      return;
    }

    // Format validation
    if (!/^KP-\d{4}-\d{4}$/.test(license)) {
      statusDiv.className = 'mt-2 p-2 rounded text-sm bg-red-100 border border-red-300 text-red-700';
      statusMsg.textContent = '❌ Invalid format. Expected: KP-YYYY-####';
      statusDiv.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Verifying...';

    // Simulate verification (backend will do real verification)
    setTimeout(() => {
      statusDiv.className = 'mt-2 p-2 rounded text-sm bg-green-100 border border-green-300 text-green-700';
      statusMsg.textContent = '✓ License format verified. Full verification with KMPDC pending.';
      statusDiv.style.display = 'block';
      btn.textContent = '✓ Verified';
      licenseInput.disabled = true;
    }, 1500);
  };

  /**
   * Update earnings preview
   */
  function updateEarningsPreview() {
    const rateInput = document.getElementById('rate_per_hour');
    const earningsSpan = document.getElementById('your-earnings');

    rateInput.addEventListener('input', function() {
      const rate = parseFloat(this.value) || 0;
      const yourEarning = Math.round(rate * (100 - PLATFORM_FEE_PERCENT) / 100);
      earningsSpan.textContent = yourEarning.toLocaleString();
    });
  }

  /**
   * Add form event listeners
   */
  function addFormEventListeners() {
    updateEarningsPreview();

    // Specializations "Other" text field visibility
    const specOtherCheckbox = document.getElementById('spec-other');
    const specOtherText = document.getElementById('spec-other-text');
    if (specOtherCheckbox) {
      specOtherCheckbox.addEventListener('change', function() {
        specOtherText.style.display = this.checked ? 'block' : 'none';
      });
    }
  }

  // Expose to window
  window.AfyaYakoCounselorForm = {
    injectCounselorFormComplete,
  };

  console.log('✓ Afya Yako Counselor Form Module Ready');
})();
