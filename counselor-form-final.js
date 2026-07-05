/**
 * Afya Yako Complete Counselor Onboarding Form - FINAL - June 20, 2026
 * With checkbox dropdowns for Specializations & Languages
 * Platform: 35% | Counselor: 65%
 */

(function() {
  'use strict';

  const PLATFORM_FEE_PERCENT = 35;
  const COUNSELOR_EARN_PERCENT = 65;

  console.log('🔧 Afya Yako Counselor Form Setup Starting...');

  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
      injectCounselorFormFinal();
    }, 500);
  });

  function injectCounselorFormFinal() {
    const formContainer = document.querySelector('form, [role="form"]');
    if (!formContainer) {
      console.log('Form container not found, retrying...');
      setTimeout(injectCounselorFormFinal, 1000);
      return;
    }

    if (document.getElementById('counselor-form-final')) {
      console.log('✓ Form already injected');
      return;
    }

    console.log('✓ Injecting complete counselor form...');

    const form = document.createElement('div');
    form.id = 'counselor-form-final';
    form.className = 'space-y-4';
    form.innerHTML = `
      <style>
        .checkbox-dropdown {
          position: relative;
          display: inline-block;
          width: 100%;
        }

        .dropdown-toggle {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
          cursor: pointer;
          text-align: left;
          font-size: 0.9rem;
        }

        .dropdown-toggle:hover {
          border-color: #9ca3af;
          background: #f9fafb;
        }

        .dropdown-menu {
          display: none;
          position: absolute;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          width: 100%;
          max-height: 250px;
          overflow-y: auto;
          top: 100%;
          left: 0;
          margin-top: 0.25rem;
        }

        .dropdown-menu.active {
          display: block;
        }

        .checkbox-item {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .checkbox-item:hover {
          background: #f9fafb;
        }

        .checkbox-item input[type="checkbox"] {
          cursor: pointer;
          accent-color: #0d9488;
        }

        .checkbox-item label {
          cursor: pointer;
          margin: 0;
          flex: 1;
        }

        .selected-items {
          margin-top: 0.5rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .selected-tag {
          background: #d1fae5;
          color: #065f46;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .selected-tag .remove {
          cursor: pointer;
          font-weight: bold;
        }
      </style>

      <!-- Professional Photo Upload -->
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

        <input type="file" id="professional_photo" name="professional_photo" accept="image/*" style="display:none" onchange="handlePhotoUpload(this)">
        <p id="photo-error" style="display:none" class="text-red-600 text-xs"></p>
      </div>

      <!-- License Document Upload -->
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

        <input type="file" id="license_document" name="license_document" accept=".pdf,.jpg,.jpeg,.png" style="display:none" onchange="handleLicenseUpload(this)">
        <p id="license-filename" style="display:none" class="text-xs text-green-600"><strong id="license-name"></strong> ✓</p>
      </div>

      <!-- Specializations Checkbox Dropdown -->
      <div class="card space-y-3">
        <h3 class="font-bold text-lg text-gray-900">🎯 Core Specialties <span class="text-red-500">*</span></h3>
        <p class="text-xs text-gray-600">Click to select specialties</p>

        <div class="checkbox-dropdown">
          <button type="button" class="dropdown-toggle" onclick="toggleDropdown('specializations-dropdown')">
            Select Specialties ▼
          </button>
          <div id="specializations-dropdown" class="dropdown-menu">
            <div class="checkbox-item">
              <input type="checkbox" id="spec-trauma" name="specializations" value="trauma" onchange="updateSpecDisplay()">
              <label for="spec-trauma">Trauma & PTSD</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="spec-couples" name="specializations" value="couples" onchange="updateSpecDisplay()">
              <label for="spec-couples">Couples & Relationship Therapy</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="spec-anxiety" name="specializations" value="anxiety" onchange="updateSpecDisplay()">
              <label for="spec-anxiety">Anxiety & Panic Disorders</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="spec-depression" name="specializations" value="depression" onchange="updateSpecDisplay()">
              <label for="spec-depression">Depression & Mood Disorders</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="spec-substance" name="specializations" value="substance_abuse" onchange="updateSpecDisplay()">
              <label for="spec-substance">Substance Abuse & Addiction</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="spec-family" name="specializations" value="family" onchange="updateSpecDisplay()">
              <label for="spec-family">Family Therapy</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="spec-grief" name="specializations" value="grief" onchange="updateSpecDisplay()">
              <label for="spec-grief">Grief & Loss</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="spec-eating" name="specializations" value="eating_disorders" onchange="updateSpecDisplay()">
              <label for="spec-eating">Eating Disorders</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="spec-ocd" name="specializations" value="ocd" onchange="updateSpecDisplay()">
              <label for="spec-ocd">OCD & Anxiety Disorders</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="spec-lgbtq" name="specializations" value="lgbtq" onchange="updateSpecDisplay()">
              <label for="spec-lgbtq">LGBTQ+ Affirming Therapy</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="spec-parenting" name="specializations" value="parenting" onchange="updateSpecDisplay()">
              <label for="spec-parenting">Parenting & Child Issues</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="spec-other" name="specializations" value="other" onchange="updateSpecDisplay()">
              <label for="spec-other">Other (specify below)</label>
            </div>
          </div>
        </div>

        <div id="spec-selected" class="selected-items"></div>

        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-1">If Other, Please Specify:</label>
          <input type="text" id="specializations_other" name="specializations_other" placeholder="Enter your other specialties..."
            class="w-full p-2 border border-gray-300 rounded-lg text-sm">
        </div>
      </div>

      <!-- Languages Checkbox Dropdown -->
      <div class="card space-y-3">
        <h3 class="font-bold text-lg text-gray-900">🌐 Languages <span class="text-red-500">*</span></h3>
        <p class="text-xs text-gray-600">Click to select languages</p>

        <div class="checkbox-dropdown">
          <button type="button" class="dropdown-toggle" onclick="toggleDropdown('languages-dropdown')">
            Select Languages ▼
          </button>
          <div id="languages-dropdown" class="dropdown-menu">
            <div class="checkbox-item">
              <input type="checkbox" id="lang-english" name="languages" value="english" checked onchange="updateLangDisplay()">
              <label for="lang-english">English</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="lang-swahili" name="languages" value="swahili" onchange="updateLangDisplay()">
              <label for="lang-swahili">Kiswahili</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="lang-french" name="languages" value="french" onchange="updateLangDisplay()">
              <label for="lang-french">French</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="lang-arabic" name="languages" value="arabic" onchange="updateLangDisplay()">
              <label for="lang-arabic">Arabic</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="lang-kikuyu" name="languages" value="kikuyu" onchange="updateLangDisplay()">
              <label for="lang-kikuyu">Kikuyu</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="lang-other" name="languages" value="other" onchange="updateLangDisplay()">
              <label for="lang-other">Other (specify below)</label>
            </div>
          </div>
        </div>

        <div id="lang-selected" class="selected-items"></div>

        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-1">If Other, Please Specify:</label>
          <input type="text" id="languages_other" name="languages_other" placeholder="Enter other languages..."
            class="w-full p-2 border border-gray-300 rounded-lg text-sm">
        </div>
      </div>

      <!-- Payment Information -->
      <div class="card space-y-4 border-2 border-green-300 bg-green-50">
        <h3 class="font-bold text-lg text-gray-900">💰 Payment Information</h3>
        <p class="text-sm font-semibold bg-white p-2 rounded border-2 border-green-400 text-green-700">
          Platform Fee: <span class="text-red-600">35%</span> | Your Earnings: <span class="text-green-700">65%</span>
        </p>

        <!-- Session Rate with Real-time Calculator -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">
            Session Rate (KES/hour) <span class="text-red-500">*</span>
          </label>
          <div class="flex items-center gap-2">
            <input type="number" id="rate_per_hour" name="rate_per_hour" placeholder="2500"
              class="flex-1 p-2 border border-gray-300 rounded-lg" min="500" required onchange="updateEarningsCalc()" oninput="updateEarningsCalc()">
            <span class="text-sm text-gray-600">KES/hr</span>
          </div>

          <!-- Earnings Preview -->
          <div class="mt-3 p-3 bg-white rounded border-2 border-green-300 space-y-2">
            <div class="text-sm text-gray-700">
              <span class="font-semibold">Per 1-hour session:</span>
            </div>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Session fee:</span>
                <span class="font-semibold" id="rate-display">0 KES</span>
              </div>
              <div class="flex justify-between border-t pt-1">
                <span class="text-red-600">Platform fee (35%):</span>
                <span class="font-semibold text-red-600" id="platform-fee">0 KES</span>
              </div>
              <div class="flex justify-between border-t pt-1 bg-green-50 p-1 rounded">
                <span class="text-green-700 font-bold">Your earnings (65%):</span>
                <span class="font-bold text-green-700" id="your-earnings">0 KES</span>
              </div>
            </div>
            <p class="text-xs text-gray-600 mt-2">Payments processed to M-Pesa within 24 hours</p>
          </div>
        </div>

        <!-- M-Pesa Number -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">
            M-Pesa Number (for payouts) <span class="text-red-500">*</span>
          </label>
          <input type="tel" id="mpesa_number" name="mpesa_number" placeholder="0712345678"
            class="w-full p-2 border border-gray-300 rounded-lg" required>
          <p class="text-xs text-gray-600 mt-1">Your M-Pesa account for receiving payments</p>
        </div>

        <!-- Bank Details (Optional) -->
        <div class="border-t pt-3">
          <h4 class="text-sm font-semibold text-gray-900 mb-2">Alternative Payment Method (Optional)</h4>
          <p class="text-xs text-gray-600 mb-2">Provide bank details if you prefer alternative payout method</p>

          <div class="space-y-2">
            <input type="text" id="bank_name" name="bank_name" placeholder="Bank Name"
              class="w-full p-2 border border-gray-300 rounded-lg text-sm">
            <input type="text" id="account_number" name="account_number" placeholder="Account Number"
              class="w-full p-2 border border-gray-300 rounded-lg text-sm">
            <input type="text" id="account_name" name="account_name" placeholder="Account Holder Name"
              class="w-full p-2 border border-gray-300 rounded-lg text-sm">
            <input type="text" id="branch_code" name="branch_code" placeholder="Branch Code (Optional)"
              class="w-full p-2 border border-gray-300 rounded-lg text-sm">
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
          <input type="checkbox" id="sop_agreed" name="sop_agreed" class="mt-1" required>
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
                 focus:outline-none focus:border-teal-600 focus:ring-0" required>
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

    // Add event listener for closing dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.checkbox-dropdown')) {
        document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
          menu.classList.remove('active');
        });
      }
    });

    // Initialize displays
    updateSpecDisplay();
    updateLangDisplay();

    console.log('✓ Counselor form injected successfully');
  }

  // Toggle dropdown
  window.toggleDropdown = function(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.classList.toggle('active');
  };

  // Update spec display
  window.updateSpecDisplay = function() {
    const checked = Array.from(document.querySelectorAll('input[name="specializations"]:checked'));
    const selectedDiv = document.getElementById('spec-selected');
    selectedDiv.innerHTML = checked.map(cb =>
      `<span class="selected-tag">${cb.parentElement.querySelector('label').textContent}<span class="remove" onclick="document.getElementById('${cb.id}').click(); updateSpecDisplay();">×</span></span>`
    ).join('');
  };

  // Update lang display
  window.updateLangDisplay = function() {
    const checked = Array.from(document.querySelectorAll('input[name="languages"]:checked'));
    const selectedDiv = document.getElementById('lang-selected');
    selectedDiv.innerHTML = checked.map(cb =>
      `<span class="selected-tag">${cb.parentElement.querySelector('label').textContent}<span class="remove" onclick="document.getElementById('${cb.id}').click(); updateLangDisplay();">×</span></span>`
    ).join('');
  };

  // Photo upload handler
  window.handlePhotoUpload = function(input) {
    const file = input.files[0];
    if (!file) return;

    const errorEl = document.getElementById('photo-error');
    const placeholder = document.getElementById('photo-placeholder');
    const preview = document.getElementById('photo-preview');

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

    const reader = new FileReader();
    reader.onload = function(e) {
      placeholder.style.display = 'none';
      preview.src = e.target.result;
      preview.style.display = 'block';
      errorEl.style.display = 'none';
    };
    reader.readAsDataURL(file);
  };

  // License upload handler
  window.handleLicenseUpload = function(input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('License document must be less than 10MB');
      return;
    }

    document.getElementById('license-name').textContent = file.name;
    document.getElementById('license-filename').style.display = 'block';
  };

  // Update earnings calculator
  window.updateEarningsCalc = function() {
    const rate = parseFloat(document.getElementById('rate_per_hour').value) || 0;
    const platformFee = Math.round(rate * PLATFORM_FEE_PERCENT / 100);
    const yourEarnings = Math.round(rate * COUNSELOR_EARN_PERCENT / 100);

    document.getElementById('rate-display').textContent = rate.toLocaleString() + ' KES';
    document.getElementById('platform-fee').textContent = platformFee.toLocaleString() + ' KES';
    document.getElementById('your-earnings').textContent = yourEarnings.toLocaleString() + ' KES';
  };

  // License verification
  window.verifyLicense = function() {
    const license = document.getElementById('kmpdc_license').value.trim();
    const btn = document.getElementById('verify-license-btn');
    const statusDiv = document.getElementById('verify-status');
    const statusMsg = document.getElementById('verify-message');

    if (!license) {
      alert('Please enter a license number');
      return;
    }

    if (!/^KP-\d{4}-\d{4}$/.test(license)) {
      statusDiv.className = 'mt-2 p-2 rounded text-sm bg-red-100 border border-red-300 text-red-700';
      statusMsg.textContent = '❌ Invalid format. Expected: KP-YYYY-####';
      statusDiv.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Verifying...';

    setTimeout(() => {
      statusDiv.className = 'mt-2 p-2 rounded text-sm bg-green-100 border border-green-300 text-green-700';
      statusMsg.textContent = '✓ License format verified. Full verification with KMPDC pending.';
      statusDiv.style.display = 'block';
      btn.textContent = '✓ Verified';
      document.getElementById('kmpdc_license').disabled = true;
    }, 1500);
  };

  window.AfyaYakoCounselorFormFinal = {
    injectCounselorFormFinal,
  };

  console.log('✓ Afya Yako Counselor Form Module Ready');
})();
